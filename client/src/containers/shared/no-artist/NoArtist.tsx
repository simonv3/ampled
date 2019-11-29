import './no-artist.scss';

import * as React from 'react';

import error_1 from '../../../images/error/error_1.png';
import error_2 from '../../../images/error/error_2.png';
import error_3 from '../../../images/error/error_3.png';

class NoArtist extends React.Component<any> {

  randomColor = () => {
    const bgColor = ['#e9c7c6', '#eddfbd', '#baddac', '#cae4e7'];
    return bgColor[Math.floor(Math.random() * bgColor.length)];
  };
  randomImage = () => {
    const errorImage = [error_1, error_2, error_3];
    return errorImage[Math.floor(Math.random() * errorImage.length)];
  };
  
  render() {
    const randomColor = this.randomColor();
    const randomImage = this.randomImage();
    return (
      <div className="no-artist">
         <style
          dangerouslySetInnerHTML={{
            __html: `body {background-color: ${randomColor} !important;}`
          }}
        />
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-6">
              <div className="no-artist__title">Artist not found</div>
              <img src={randomImage} className="no-artist__image" alt="Artist not found" />
            </div>
          </div>
        </div>
      </div>
    )
  };
}

export { NoArtist };