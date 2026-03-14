import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_FILE = path.join(__dirname, 'local_database.json');

// Initialize DB
if (!fs.existsSync(DB_FILE)) {
    const initialData = {
        users: [
            // Default Admin
            { 
                id: 'admin-uuid', 
                email: 'admin@authai.pro', 
                password_hash: '$2a$10$X.v.v.v.v.v.v.v.v.v.v.e.e.e.e.e.e.e.e.e.e', // Mock hash (we'll overwrite or handle in code)
                role: 'ADMIN', 
                credits: 999,
                created_at: new Date().toISOString()
            }
        ],
        certificates: []
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
}

const readDB = () => {
    try {
        const data = fs.readFileSync(DB_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return { users: [], certificates: [] };
    }
};

const writeDB = (data) => {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
};

export const db = {
    users: {
        findEmail: (email) => {
            const data = readDB();
            return data.users.find(u => u.email === email);
        },
        create: (user) => {
            const data = readDB();
            data.users.push(user);
            writeDB(data);
            return user;
        },
        updateCredits: (email, credits) => {
            const data = readDB();
            const user = data.users.find(u => u.email === email);
            if (user) {
                user.credits = credits;
                writeDB(data);
                return user;
            }
            return null;
        }
    },
    certificates: {
        create: (cert) => {
            const data = readDB();
            data.certificates.push(cert);
            writeDB(data);
            return cert;
        },
        findById: (id) => {
            const data = readDB();
            return data.certificates.find(c => c.id === id);
        }
    }
};
