import * as React from 'react';

import phone from '../../images/home/home_how_phone.png';
import tear_1 from '../../images/home/home_tear_1.png';
import tear_2 from '../../images/home/home_tear_2.png';

export const HomeHow = () => (
  <div className="home-how">
    <img className="tear tear_1" src={tear_1} />
    <div className="container">
      <div className="row">
        <div className="col-md-12">
          <h1 className="home-how__title">How it Works</h1>
        </div>
      </div>

      <div className="home-how__list">
        <div className="row">
          <div className="col-md-7">
            <div className="row home-how__list-item">
              <div className="col-2">
                <div className="home-how__list-item_number">01</div>
              </div>
              <div className="col-10">
                <div className="home-how__list-item_title">
                  Artists post unique/ unreleased content.
                </div>
                <div className="home-how__list-item_copy">
                Artists on Ampled post things you won’t find anywhere else - like demos, unreleased recordings, access to exclusive merch, discounts, personal notes, announcements - and more.
                </div>
              </div>
            </div>
            <div className="row home-how__list-item">
              <div className="col-2">
                <div className="home-how__list-item_number">02</div>
              </div>
              <div className="col-10">
                <div className="home-how__list-item_title">Artists are supported directly by their community</div>
                <div className="home-how__list-item_copy">
                  Artists can be supported directly for $3 or more per month - unlocking access to their exclusive content.
                </div>
              </div>
            </div>
            <div className="row home-how__list-item">
              <div className="col-2">
                <div className="home-how__list-item_number no-tail">03</div>
              </div>
              <div className="col-10">
                <div className="home-how__list-item_title">Artists collect monthly recurring revenue</div>
                <div className="home-how__list-item_copy">
                  When an artist posts something new, their supporters get a notification. 
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-5">
            <img className="home-how__list-image" src={phone} />
          </div>
        </div>
      </div>
    </div>
    <img className="tear tear_2" src={tear_2} />
  </div>
);
