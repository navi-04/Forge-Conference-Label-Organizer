I'm building a Forge app for Atlassian Confluence Cloud called "Label Organizer".

🔧 Tech stack:
- Atlassian Forge (Confluence Cloud)
- Custom UI (React frontend)
- Node.js backend (using Forge resolver)
- REST API calls using @forge/api
- CI/CD using GitHub Actions

📦 App Objective:
This app helps users manage labels used across Confluence pages in a specific space. It should allow the following:

---

✅ Features to Implement:

1. **Display Labels Table**
   - Show a list of all unique labels used in a space
   - Columns: `Label name`, `Usage count` (e.g. "2 pages", "3 blog posts"), and an actions menu

2. **Add Label**
   - Button to open a modal to input a new label and attach it to one or more selected pages

3. **Delete Label**
   - Select one or more labels and remove them from all associated content

4. **Merge Labels**
   - Select multiple labels and merge them into a new or existing label
   - Update all pages using old labels to use the merged one

5. **Search Bar**
   - Search/filter labels by name in real time

6. **Export to CSV**
   - Export the label list (with usage data) to a downloadable `.csv` file

---

🔌 Backend API Requirements (Forge resolver):

- `GET /wiki/rest/api/content?type=page&spaceKey=...`
- `GET /wiki/rest/api/content/{id}/label`
- `POST /wiki/rest/api/content/{id}/label`
- `DELETE /wiki/rest/api/content/{id}/label`

Use `@forge/api` with `api.asApp().requestConfluence(...)` for all Confluence API calls.

---

💾 Project Structure:

