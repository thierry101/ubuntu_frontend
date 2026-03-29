/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-var */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatDate',
  standalone: true
})
export class FormatDatePipe implements PipeTransform {

  transform(value: any, ...args: unknown[]): any {
    if(value){
      const dateSplited = (value.split('T')[0])
      const dateSplitedOk = dateSplited.split('-')
      return dateSplitedOk[2] + '-' + dateSplitedOk[1] + '-' + dateSplitedOk[0]
    }
  }

}

// on rajoute egalement date: 'd MMM, y':"":"fr" pour avoir la date avec le mois en lettre;
// si on veut avoir le mois en chiffre on retire le fr