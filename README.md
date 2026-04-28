# MK Studio Pune — Website Package
## Deployment Guide for Shared Hosting

---

## 📁 Folder Structure

```
mkstudio/
├── index.html          ← Main website (homepage)
├── css/
│   ├── style.css       ← Public site styles (Apple palette)
│   └── admin.css       ← Admin panel styles
├── js/
│   ├── main.js         ← Public site JavaScript
│   └── admin.js        ← Admin panel JavaScript
├── data/
│   └── content.json    ← All website content (editable via admin)
├── images/             ← Upload your images here
│   ├── hero/
│   ├── equipment/
│   ├── productions/
│   ├── gallery/
│   └── team/
└── admin/
    ├── index.html      ← Admin panel (CMS)
    ├── save.php        ← Server-side save handler
    └── upload.php      ← File upload handler
```

---

## 🚀 How to Deploy on cPanel / Shared Hosting

### Step 1: Upload Files
1. Log in to your hosting control panel (cPanel, Plesk, etc.)
2. Open **File Manager**
3. Navigate to your website root: `public_html/` or `www/`
4. Upload the entire `mkstudio/` folder, OR upload its contents directly to root

### Step 2: Set File Permissions
In File Manager or via FTP:
- Set `data/` folder to **755** (writable)
- Set `images/` and all subfolders to **755**
- Set `data/content.json` to **644**

```bash
# Via SSH (if available):
chmod 755 data/
chmod 755 images/ images/*/
chmod 644 data/content.json
```

### Step 3: Test the Site
- Visit `https://yourdomain.com/` — main website should load
- Visit `https://yourdomain.com/admin/` — admin panel should open

### Step 4: Enable Server-Side Saving (PHP)
Your hosting must support PHP 7.4+.
1. Confirm `admin/save.php` and `admin/upload.php` are uploaded
2. In the admin panel, any save action will POST to `save.php`
3. Changes are written to `data/content.json` automatically
4. Backups are saved in `data/backups/` (last 10 kept)

---

## 🔐 Securing the Admin Panel

**Add password protection to the admin/ folder:**

### Option A: cPanel → Password Protect Directories
1. cPanel → Security → Password Protect Directories
2. Select `/admin` folder
3. Create a username and password

### Option B: .htaccess (create file at `admin/.htaccess`)
```apache
AuthType Basic
AuthName "MK Studio Admin"
AuthUserFile /home/yourusername/.htpasswd
Require valid-user
```
Then create `.htpasswd` via cPanel → Password Protect Directories.

---

## 📧 Enable Contact Form Emails

Edit `admin/save.php` — add a contact form handler, or:

1. Sign up at **Formspree.io** (free)
2. Replace the form `action` in `index.html`:
```html
<form action="https://formspree.io/f/YOUR_FORM_ID" method="POST" id="contactForm">
```

---

## 🔄 Updating Content

**Via Admin Panel (recommended):**
1. Go to `https://yourdomain.com/admin/`
2. Edit services, equipment, productions, gallery, testimonials
3. All changes save to `data/content.json`

**Via Direct File Edit:**
1. Download `data/content.json`
2. Edit the JSON
3. Re-upload to `data/content.json`

---

## 🌐 Domain Setup (mkstudiopune.com)

1. Point your domain's DNS A record to your hosting server IP
2. Add `mkstudiopune.com` as an addon domain in cPanel
3. Point document root to where you uploaded the site files
4. Enable SSL via cPanel → SSL/TLS → Let's Encrypt (free)

---

## 📞 Support

For technical help, contact your web developer or hosting support.
Studio contact: +91 98811 92236 | mkstudiopune.com
