import { Injectable } from '@angular/core';
import { Broker, IBroker } from 'trading';
import { FakeRepository } from 'communication';

@Injectable({
  providedIn: 'root',
})
export class RealBrokersRepository extends FakeRepository<IBroker> {
  protected async _getItems() {
    return [
      {
        id: 1,
        name: Broker.Rithmic,
        title: 'Rithmic',
        logo: 'rithmic.png',
        description: `
          <img src="assets/img/brokers/omne.png" alt="" />
          is a trademark of Omnesys, LLC and Omnesys Technologies, Inc.  All rights reserved.
          The R | API™, R | API+™ and R | Protocol API™ software is Copyright © 2020 by Rithmic, LLC.  All rights reserved.
          Trading Platform by Rithmic™ is a trademark of Rithmic, LLC.  All rights reserved.
          The OMNE™ software is Copyright © 2020 by Omnesys, LLC and Omnesys Technologies, Inc.  All rights reserved.
        `,
      },
    ];
  }
}
