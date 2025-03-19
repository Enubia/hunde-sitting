import fs from 'node:fs';
import path from 'node:path';

export default class FileLogger {
    private filePath: string;
    private writeStream: fs.WriteStream;
    constructor() {
        this.filePath = path.join(process.cwd(), 'logs', this.getFileName());

        if (!fs.existsSync(this.filePath)) {
            fs.writeFileSync(this.filePath, '');
        }

        this.writeStream = fs.createWriteStream(this.filePath, { flags: 'a' });
    }

    log(message?: string) {
        if (!message) {
            return;
        }

        this.writeToFile(`${message}\n`);
    }

    closeStream() {
        this.writeStream.close();
    }

    private getFileName() {
        return `${new Date().toISOString().split('T')[0]}.log`;
    }

    private writeToFile(message: string) {
        this.writeStream.write(message, (err) => {
            if (err) {
                console.error('Error writing to file:', err);
                this.closeStream();
            }
        });
    }
}
