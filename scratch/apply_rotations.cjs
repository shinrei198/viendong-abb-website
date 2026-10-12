const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const rotationMap = {
  // VELET 120
  '505222': 270, // Mặt 1 thiết bị 2M -> Horizontal, ABB logo bottom-left upright
  '505223': 270, // Mặt 3 thiết bị 1M -> Horizontal, ABB logo bottom-left upright
  '505220': 90,  // Mặt cho CB cóc -> Vertical plate, ABB logo bottom-left upright
  '505331': 270, // Ổ cắm đôi 3 chấu 16A 3M -> Horizontal sockets, 16A 250V~ bottom upright
  '505131': 90,  // Ổ cắm đơn 2 chấu 16A 1M -> Vertical 1M
  '505137': 90,  // Ổ cắm đơn 2 chấu 16A 1M Cắm nhanh -> Vertical 1M
  '505411': 90,  // Đèn báo đỏ 1M -> Vertical 1M

  // MAYPLE 120
  '506221': 90,  // Mặt 1 thiết bị 1M -> Horizontal, ABB logo bottom-left upright
  '506222': 90,  // Mặt 1 thiết bị 2M -> Horizontal, ABB logo bottom-left upright
  '506225': 90,  // Mặt 2 thiết bị 1M -> Horizontal, ABB logo bottom-left upright
  '506223': 90,  // Mặt 3 thiết bị 1M -> Horizontal, ABB logo bottom-left upright
  '506227': 90,  // Mặt che trơn -> Horizontal, ABB logo bottom-left upright
  '506224': 270, // Mặt 4 thiết bị 1M (khung đôi) -> Vertical slots, ABB logo bottom-left upright
  '506226': 270, // Mặt 6 thiết bị 1M (khung ba) -> Vertical slots, ABB logo bottom-left upright
  '506231': 270, // Ổ cắm đơn 3 chấu 16A 2M -> Horizontal, 16A 250V~ bottom upright
  '506331': 270, // Ổ cắm đôi 3 chấu 16A 3M -> Horizontal sockets, 16A 250V~ bottom upright
  '506338': 270, // Ổ cắm đôi 3 chấu 16A 3M loại BH -> Horizontal sockets, 16A 250V~ bottom upright
  '506243': 90,  // Ổ sạc USB type A+C 15W 2M -> Horizontal, 5V===3100mA bottom upright
};

// Target directories
const targetDirs = [
  path.resolve(__dirname, '../public/products'),
  path.resolve(__dirname, '../Product_Img/VienDong_ABB_WebP')
];

function getAllFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getAllFiles(fullPath, fileList);
    } else if (file.toLowerCase().endsWith('.webp')) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

async function run() {
  console.log('--- SCANNING FILES FOR ROTATION ---');
  let totalRotated = 0;

  for (const targetDir of targetDirs) {
    console.log('\nChecking directory:', targetDir);
    const files = getAllFiles(targetDir);
    console.log(`Found ${files.length} WebP files in ${targetDir}`);

    for (const filePath of files) {
      const fileName = path.basename(filePath);
      
      // Check which key matches
      for (const [skuKey, deg] of Object.entries(rotationMap)) {
        // Must match the skuKey in fileName, and only in 120 series folders
        const is120 = filePath.includes('120') || filePath.includes('Velet120') || filePath.includes('Mayple120');
        if (is120 && fileName.toUpperCase().includes(skuKey)) {
          // Special distinction:
          // Make sure 505131 only rotates 4TYB505131, not 4TYD505131 (network socket)
          if (skuKey === '505131' && fileName.toUpperCase().includes('4TYD')) {
            continue; // Skip network socket Cat5e
          }
          // Make sure 505411 only rotates 4TYX505411 (red light), not 4TYA505411 (switch 1.5M)
          if (skuKey === '505411' && fileName.toUpperCase().includes('4TYA')) {
            continue; // Skip switch 1.5M
          }

          console.log(`[ROTATE ${deg}°] ${path.relative(path.resolve(__dirname, '../..'), filePath)}`);
          
          // Read buffer
          const buf = fs.readFileSync(filePath);
          // Rotate and save
          const rotatedBuf = await sharp(buf).rotate(deg).webp({ quality: 90 }).toBuffer();
          fs.writeFileSync(filePath, rotatedBuf);
          totalRotated++;
          break; // Next file
        }
      }
    }
  }

  console.log(`\n=== COMPLETED ROTATING ${totalRotated} IMAGES! ===`);
}

run().catch(err => {
  console.error('Error applying rotations:', err);
  process.exit(1);
});
