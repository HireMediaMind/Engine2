# Admin Guide: How to Write & Upload Blog Posts (Safe Mode)

Follow this guide to avoid the "Code Showing" error and ensure images appear correctly.

## 1. Prepare Your Content
Do not write directly in code editors if you are not comfortable.
1.  Open **Notepad** or a simple Text Editor.
2.  Write your article.

## 2. Format as Markdown
Markdown is simple. Just use these symbols:

**Headings**:
Use `#` for main title (only one at top) and `##` for section titles.
```markdown
# My Article Title
## Introduction
## Section 1
```

**Paragraphs**:
Just write text. Leave a blank line between paragraphs.

**Bold**:
`**This text is bold**`

**Images**:
To add an image, use this format:
`![Description of image](https://link-to-image.jpg)`
*Tip: Use images from Unsplash.com or upload your image to a hosting site and copy the link.*

## 3. Saving the File
1.  Save the file as `my-article-name.md`.
2.  **IMPORTANT**: Make sure it ends in `.md`, NOT `.md.txt`.

## 4. Uploading (The "Spoon Feed" Method)
1.  **Placement**: Put your `.md` file in `public/content/blog/`.
    *   Example: `public/content/blog/my-article-name.md`
2.  **Registration**: You MUST tell the website the file exists.
    *   Open `src/data/blog-posts.ts`.
    *   Copy-paste the last block and edit it:
    ```typescript
    {
        slug: "my-article-name", // MUST MATCH FILENAME EXACTLY (no .md)
        title: "My Article Title",
        excerpt: "Short summary...",
        category: "Marketing",
        readTime: "5 min read",
        date: "Feb 2026",
        author: "You",
        coverImage: "https://link-to-image.jpg",
    },
    ```

## 5. Troubleshooting "Code Showing"
If you see `<doctype html>` or weird code instead of your article:
*   **Cause**: The website cannot find your `.md` file.
*   **Fix**: Check the `slug` in `blog-posts.ts`. Does it match the filename in `public/content/blog/`?
    *   `slug: "my-post"` -> File **MUST** be `my-post.md`.
    *   `slug: "My Post"` -> **WRONG** (Avoid spaces in filenames).

## 6. Going Live
After adding the file and updating the registry:
1.  Run `npm run build`.
2.  Upload the `dist` folder to Hostinger.
