import { spawn } from 'child_process';

export class TagService {
  async applyTag(filePath: string, tag: string, color: number) {
    return new Promise<void>((resolve, reject) => {
      const plistXML = this.getPlistXML(tag, color);

      const proc = spawn('xattr', [
        '-w',
        'com.apple.metadata:_kMDItemUserTags',
        plistXML,
        filePath,
      ]);

      proc.stderr.on('data', (data) => {
        reject(new Error(`xattr stderr: ${data.toString()}`));
      });

      proc.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`xattr failed with code ${code}`));
        }
      });
    });
  }

  private getPlistXML(tag: string, color: number) {
    return (
      `<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">` +
      `<plist version="1.0"><array><string>${tag}\n${color}</string></array></plist>`
    );
  }
}
