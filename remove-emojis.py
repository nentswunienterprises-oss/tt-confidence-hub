import re

# Read the file
with open(r'C:\Users\Thend\Downloads\Technology\PodDigitizer\client\src\pages\operational\tutor\blueprint.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove emojis using regex (matches most emoj Unicode ranges)
emoji_pattern = re.compile("["
                          u"\U0001F600-\U0001F64F"  # emoticons
                          u"\U0001F300-\U0001F5FF"  # symbols & pictographs
                          u"\U0001F680-\U0001F6FF"  # transport & map symbols
                          u"\U0001F1E0-\U0001F1FF"  # flags
                          u"\U00002702-\U000027B0"
                          u"\U000024C2-\U0001F251"
                          u"\U0001F900-\U0001F9FF"  # supplemental symbols
                          "]+", flags=re.UNICODE)

content = emoji_pattern.sub('', content)

# Replace checkmarks with bullets
content = content.replace('✓', '•')
content = content.replace('✅', '•')
content = content.replace('❌', '')

# Write back
with open(r'C:\Users\Thend\Downloads\Technology\PodDigitizer\client\src\pages\operational\tutor\blueprint.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Emojis removed successfully!")
