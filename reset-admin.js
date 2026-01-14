
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, 'server/local_database.json');

const resetAdmin = async () => {
    const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    
    // Hash "admin"
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash("admin", salt);
    
    // Find admin and update
    const admin = data.users.find(u => u.email === 'admin@authai.pro');
    if(admin) {
        admin.password_hash = hash;
        console.log("Admin password reset to 'admin'");
    }

    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
};

resetAdmin();
