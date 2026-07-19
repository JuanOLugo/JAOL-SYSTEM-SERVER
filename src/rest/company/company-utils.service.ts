import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

@Injectable()
export class CompanyUtilsService {
  public generateCompanyCode(companyName: string): string {
    const uuid = randomUUID().replace(/-/g, '').substring(0, 3).toUpperCase();

    return `COMPANY-${companyName.toUpperCase().trim().slice(0, 3).toUpperCase()}-${uuid}`;
  }
}
