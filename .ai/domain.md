# Approved domain rules

Preserve these implemented candidate and PDF rules:

| Field               | Required          | Maximum length |
| ------------------- | ----------------- | -------------- |
| fullName            | Yes               | 150            |
| email               | Yes, valid format | 254            |
| phone               | No                | 30             |
| desiredPosition     | No                | 150            |
| professionalSummary | No                | 2000           |

- Email uniqueness is not required; duplicate emails are allowed.
- Manual and PDF-assisted registration use one form and one final persistence endpoint.
- PDF extraction suggests name, email and phone; the user reviews before saving. A suggestion
  fills a frontend field only when it is empty; non-null suggestions never overwrite text already
  entered by the user, and null suggestions leave the field unchanged.
- Missing or unreadable PDF information never prevents manual registration.
- PDF upload is optional; maximum size is `5 * 1024 * 1024` bytes.
- Validate content as well as declared file information. Never trust filenames alone.
- Read PDF in memory and discard it. No file paths, uploads directory or Resume entity.
- `POST /api/resumes/extract` accepts one multipart `file` and returns nullable `fullName`,
  `email` and `phone` suggestions; it does not create a candidate.
- Validate the MIME as `application/pdf` and the initial `%PDF-` signature. Files above the
  exact 5 MiB limit return 413; non-PDF content returns 415; valid PDFs without usable text
  return 422 `PDF_TEXT_UNAVAILABLE`.
- `pdfjs-dist` extracts text in memory. No external AI extraction service or OCR is planned.
