import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

type ConfigType = {
  nationalities: string[];
  religions: string[];
  statesAndUnions: string[];
};

@Injectable()
export class ReferenceService {
  private readonly baseDirs = [
    path.resolve(process.cwd(), 'src', 'dev-data'),
    path.resolve(process.cwd(), 'dist', 'dev-data'),
    path.resolve(__dirname, '..', 'dev-data'),
  ];

  private readJsonArray(fileNames: string | string[]): string[] {
    const names = Array.isArray(fileNames) ? fileNames : [fileNames];

    for (const base of this.baseDirs) {
      for (const name of names) {
        const filePath = path.join(base, name);
        if (!fs.existsSync(filePath)) continue;

        const raw = fs.readFileSync(filePath, 'utf-8');
        const parsed = JSON.parse(raw);

        if (Array.isArray(parsed)) return parsed as string[];
        if (parsed && Array.isArray(parsed.items))
          return parsed.items as string[];
        return [];
      }
    }

    return [];
  }

  public getConfig(): ConfigType {
    const nationalities = this.readJsonArray([
      'nationalities.json',
      'nationalties.json',
    ]);
    const religions = this.readJsonArray('religion.json');
    const statesAndUnions = this.readJsonArray('states&unions.json');
    return { nationalities, religions, statesAndUnions };
  }
}
