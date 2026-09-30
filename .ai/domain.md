# Approved domain rules

The current foundation does not implement candidate features. Preserve these rules for later Issues:

| Field               | Required          | Maximum length |
| ------------------- | ----------------- | -------------- |
| fullName            | Yes               | 150            |
| email               | Yes, valid format | 254            |
| phone               | No                | 30             |
| desiredPosition     | No                | 150            |
| professionalSummary | No                | 2000           |

- Email uniqueness is not required; duplicate emails are allowed.
- Manual and PDF-assisted registration use one form and one final persistence endpoint.
- PDF extraction suggests name, email and phone; the user reviews before saving.
- Missing or unreadable PDF information never prevents manual registration.
- PDF upload is optional; maximum size is `5 * 1024 * 1024` bytes.
- Validate content as well as declared file information. Never trust filenames alone.
- Read PDF in memory and discard it. No file paths, uploads directory or Resume entity.
- Choose the PDF library in its own Issue; no external AI extraction service or OCR is planned.
- REST contracts will be agreed when starting the candidate API, not during foundation.
