import fs from 'node:fs';
import path from 'node:path';

const FIVE_MINUTES = 60 * 5 * 1000;

export default class FileLogger {
    private fileDate: string = '';
    private filePath: string;
    private writeStream: fs.WriteStream;

    constructor() {
        this.filePath = path.join(process.cwd(), 'logs', this.getFileName());

        if (!fs.existsSync(this.filePath)) {
            fs.writeFileSync(this.filePath, '');
        }

        this.writeStream = fs.createWriteStream(this.filePath, { flags: 'a' });

        this.writeStream.on('error', (err) => {
            console.error('Error writing to file:', err);
            this.closeStream();
        });

        setInterval(() => {
            this.checkCurrentDate();
        }, FIVE_MINUTES);
    }

    closeStream() {
        this.writeStream.close();
    }

    log(message?: string, ...args: unknown[]) {
        if (!message) {
            return;
        }

        const _args: unknown[] = [];

        for (const arg of args) {
            if (typeof arg === 'object') {
                _args.push(JSON.stringify(arg, null, 4));
            } else {
                _args.push(arg);
            }
        }

        this.writeToFile(`${message} ${_args}\n`);
    }

    private checkCurrentDate() {
        const currentDate = new Date().toISOString().split('T')[0];

        if (currentDate !== this.fileDate) {
            this.rotateFile();
        }
    }

    private getFileName() {
        this.fileDate = new Date().toISOString().split('T')[0];
        return `${this.fileDate}.log`;
    }

    private rotateFile() {
        this.writeStream.close();
        this.filePath = path.join(process.cwd(), 'logs', this.getFileName());
        this.writeStream = fs.createWriteStream(this.filePath, { flags: 'a' });
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
