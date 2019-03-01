import * as React from 'react';

import header_collage from '../../images/home/home_header_collage.png';
import support from '../../images/home/home_header_support.png';


interface Props {
}

class HomeHeader extends React.Component<Props, any> {
  render() {
    return (
      <section className="home-header">
        <div className="container">
          <img className="home-header__support" src={support} />
          <div className="row">
            <div className="col-md-4">
              <div className="home-header__info">
                Ampled is a space where music artists post unreleased, unique, or exclusive content and are directly supported on a monthly basis by their audience.
                            </div>
              <button className="home-header__button btn">
                Create an Artist Page
                            </button>
            </div>

            <div className="col-md-8">
              <img src={header_collage} className="home-header__collage" />
            </div>
          </div>
        </div>
      </section>
    );
  }
}

export { HomeHeader };
