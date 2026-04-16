import { createClient } from "@supabase/supabase-js";

function getArg(flag) {
  const index = process.argv.indexOf(flag);
  if (index === -1) return null;
  return process.argv[index + 1] ?? null;
}

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function parseNameParts(fullName) {
  const trimmed = (fullName || "").trim().replace(/\s+/g, " ");
  if (!trimmed) {
    return { firstName: "", lastName: "", fullName: "" };
  }

  const parts = trimmed.split(" ");
  if (parts.length === 1) {
    return {
      firstName: parts[0],
      lastName: "",
      fullName: trimmed,
    };
  }

  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
    fullName: trimmed,
  };
}

async function main() {
  const supabaseUrl = requireEnv("SUPABASE_URL");
  const serviceRoleKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");

  const email = getArg("--email");
  const userIdArg = getArg("--user-id");
  const role = getArg("--role");
  const listOnly = process.argv.includes("--list-only");
  const fullNameArg = getArg("--full-name");
  const firstNameArg = getArg("--first-name");
  const lastNameArg = getArg("--last-name");

  if (!email && !userIdArg && !role) {
    throw new Error("Provide one of --email, --user-id, or --role");
  }

  if (!listOnly && !fullNameArg && !firstNameArg && !lastNameArg) {
    throw new Error("Provide --full-name or --first-name/--last-name");
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  let query = supabase.from("users").select("id, email, role, first_name, last_name, name");

  if (userIdArg) {
    query = query.eq("id", userIdArg);
  } else if (email) {
    query = query.eq("email", email);
  } else if (role) {
    query = query.eq("role", role);
  }

  const { data: matches, error: userLookupError } = await query;
  if (userLookupError) {
    throw new Error(`Failed to look up user: ${userLookupError.message}`);
  }

  if (!matches || matches.length === 0) {
    throw new Error("No matching user found in public.users");
  }

  if (matches.length > 1) {
    console.error("Multiple matching users found:");
    for (const match of matches) {
      console.error(`- ${match.id} | ${match.email} | ${match.role} | ${match.name}`);
    }
    throw new Error("Refine the target with --email or --user-id");
  }

  const target = matches[0];

  if (listOnly) {
    console.log(JSON.stringify(target, null, 2));
    return;
  }

  const parsed = fullNameArg
    ? parseNameParts(fullNameArg)
    : parseNameParts([firstNameArg || "", lastNameArg || ""].filter(Boolean).join(" "));

  const firstName = firstNameArg ?? parsed.firstName;
  const lastName = lastNameArg ?? parsed.lastName;
  const fullName = (fullNameArg ?? [firstName, lastName].filter(Boolean).join(" ")).trim();

  if (!fullName) {
    throw new Error("Resolved full name is empty");
  }

  console.log("Target user:");
  console.log(JSON.stringify(target, null, 2));
  console.log("Updating to:");
  console.log(JSON.stringify({ firstName, lastName, fullName }, null, 2));

  const { error: publicUpdateError } = await supabase
    .from("users")
    .update({
      first_name: firstName || null,
      last_name: lastName || null,
      name: fullName,
      updated_at: new Date().toISOString(),
    })
    .eq("id", target.id);

  if (publicUpdateError) {
    throw new Error(`Failed to update public.users: ${publicUpdateError.message}`);
  }

  const { data: updatedAuth, error: authUpdateError } = await supabase.auth.admin.updateUserById(
    target.id,
    {
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        full_name: fullName,
        name: fullName,
      },
    }
  );

  if (authUpdateError) {
    throw new Error(`Failed to update auth metadata: ${authUpdateError.message}`);
  }

  console.log("Updated auth metadata:");
  console.log(JSON.stringify(updatedAuth.user?.user_metadata ?? {}, null, 2));
  console.log("Done. The user should sign out and sign back in to refresh their session.");
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
