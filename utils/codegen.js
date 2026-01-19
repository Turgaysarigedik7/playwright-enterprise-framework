const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const baseUrl = process.env.BASE_URL || '';
const isAuth = process.argv.includes('--auth');
const isStealth = process.argv.includes('--stealth');
const isSave = process.argv.includes('--save');

// 1. Dizinleri Hazırla
const authDirAbs = path.join(process.cwd(), 'playwright', '.auth');
const authFileRel = path.join('playwright', '.auth', 'recorder_user.json');
const authFileAbs = path.join(process.cwd(), authFileRel);

if (!fs.existsSync(authDirAbs)) {
    fs.mkdirSync(authDirAbs, { recursive: true });
}

// Komutu oluştur 
let command = 'npx playwright codegen';

if (isStealth) {
    const fileExists = fs.existsSync(authFileAbs);

    // Eğer --save parametresi varsa hem yükle hem kaydet (Güncelleme Modu)
    if (isSave) {
        command += ` --save-storage="${authFileRel}"`;
        if (fileExists) command += ` --load-storage="${authFileRel}"`;
    } else {
        // Standart Stealth: Sadece yükle, dosya boyutu şişmesin (Read-only Modu)
        if (fileExists) {
            command += ` --load-storage="${authFileRel}"`;
        } else {
            // Dosya yoksa mecburen ilk kaydı yapması için save-storage ekliyoruz
            command += ` --save-storage="${authFileRel}"`;
            console.log(`ℹ️  No session file found. Creating initial session in ${authFileRel}`);
        }
    }
} else if (isAuth && fs.existsSync(authFileAbs)) {
    command += ` --load-storage="${authFileRel}"`;
}

command += ` ${baseUrl}`;

console.log(`\n🚀 Recorder Starting...`);
console.log(`🌐 URL: ${baseUrl || 'Blank Page'}`);
if (isStealth) {
    console.log(`🛡️  Stealth Mode: ${isSave ? 'Update/Save (Writes to file)' : 'Read-only (File size preserved)'}`);
}

try {
    execSync(command, { stdio: 'inherit' });
} catch (error) {
    console.log(`\nℹ️  Recorder closed.`);
} finally {
    // 2. Otomatik temizlik 
    // Sadece standart "codegen" veya "codegen:auth" kullanılıyorsa temizle.
    // Stealth modunda (ister save olsun ister olmasın) dosyayı koruyoruz.
    if (!isStealth) {
        if (fs.existsSync(authFileAbs)) {
            fs.unlinkSync(authFileAbs);
            console.log(`\n🧹 Session data cleaned up.`);
        }
    } else if (isSave) {
        console.log(`\n💾 Stealth session updated and saved.`);
    }
}
