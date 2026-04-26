# Brain Memory -Data & Privacy

Document how data is handled, protected, and managed in your system.

## 1. Data Classification

What types of data does your system handle?

| Data Type | Classification | Sensitivity | Storage | Retention |
|-----------|-----------------|------------|---------|-----------|
| User credentials | Sensitive | High | Encrypted | Until deletion |
| Customer emails | PII | Medium | Encrypted | Per GDPR/policy |
| Analytics data | Internal | Low | Plain | 2 years |
| [Add more] | | | | |

## 2. Privacy & Compliance

- **Relevant regulations**: (GDPR, CCPA, HIPAA, etc.)
- **Privacy policy**: [Link]
- **Data processing agreement**: [Link]
- **Consent collection**: [How and where]
- **Data retention policy**: [How long data is kept]
- **Right to deletion**: [How data is deleted]
- **Data subject access**: [Process for DSAR requests]

## 3. Data Encryption

- **Encryption in transit**: [Protocol, e.g., TLS 1.3]
- **Encryption at rest**: [Method, e.g., AES-256]
- **Key management**: [How keys are stored and rotated]
- **Encrypted fields**: [Which fields are encrypted]

## 4. Access Control to Data

- **Who can access what data?** [Role-based access control]
- **How is access logged?** [Audit trail]
- **Data masking in non-prod**: [How test data is created]
- **Anonymization process**: [How PII is removed]

## 5. Data Flows

- **Where does data come from?** [Sources: forms, APIs, imports, etc.]
- **Where does data go?** [Destinations: databases, files, third-party services]
- **How is data moved between systems?** [APIs, batch jobs, webhooks, etc.]
- **Are there data enrichment steps?** [What data is added/modified]

## 6. Backup & Recovery

- **Backup frequency**: [Daily, hourly, continuous]
- **Backup location**: [Where backups are stored]
- **Backup retention**: [How long backups are kept]
- **Recovery testing**: [When was it last tested?]
- **RTO (Recovery Time Objective)**: [Target recovery time]
- **RPO (Recovery Point Objective)**: [Acceptable data loss]

## 7. Data Quality & Validation

- **Data validation rules**: [What checks are performed]
- **Data quality metrics**: [What is monitored]
- **Duplicate detection**: [How duplicates are found]
- **Data reconciliation**: [How data is verified across systems]

## 8. Third-Party Data Sharing

- **What data is shared with third parties?** [List]
- **Why is it shared?** [Purpose]
- **How is it shared?** [Method]
- **Who has access?** [Third-party description]
- **Data processing agreements**: [Are they in place?]

## 9. Data Deletion & Archival

- **How is data deleted?** [Process and tools]
- **Is deletion reversible?** [Can data be recovered?]
- **What data is archived?** [Criteria]
- **How long is archived data kept?** [Timeline]
- **How is archived data accessed?** [Process]

## 10. Audit & Compliance

- **Data audit logs**: [What events are logged]
- **Log retention**: [How long logs are kept]
- **Compliance certifications**: [SOC 2, ISO 27001, etc.]
- **Security assessments**: [When and how often]
- **Vulnerability scanning**: [Tools and frequency]

## 11. Incident Response for Data Breaches

- **Detection process**: [How breaches are discovered]
- **Notification timeline**: [How quickly affected users are notified]
- **Escalation path**: [Who to contact first]
- **Containment steps**: [What to do immediately]
- **Regulatory notifications**: [Who needs to be notified]

## 12. Data Minimization

- **What data is essential?** [Core fields only]
- **What data is unnecessary?** [What should be deleted]
- **Consent for non-essential data**: [Do we have consent?]
- **Data reduction plan**: [How to minimize collected data]

