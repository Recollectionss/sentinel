import { spawn } from 'child_process';

export function applyTag(filePath: string, tag: string, color: number) {
  return new Promise<void>((resolve, reject) => {
    const tagString = `${tag}\n${color}`;
    const plistXML = `<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">` +
      `<plist version="1.0"><array><string>${tagString}</string></array></plist>`;

    const proc = spawn('xattr', [
      '-w',
      'com.apple.metadata:_kMDItemUserTags',
      plistXML,
      filePath,
    ]);

    proc.stderr.on('data', (data) => {
      console.error('xattr stderr:', data.toString());
    });

    proc.on('close', (code) => {
      if (code === 0) {
        console.log('✅ Tag applied successfully.');
        resolve();
      } else {
        reject(new Error(`xattr failed with code ${code}`));
      }
    });
  });
}
