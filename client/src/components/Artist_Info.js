import React from "react";

export default class ArtistInfo extends React.Component {
  render() {
    return (
        <div className="artist-info container">
          <div className="row justify-content-between">
            <div className="col-md-4">
              <div className="artist-info__location">
                <i className="fas fa-map-marker-alt"></i> Cleveland, Ohio
              </div>
            </div>
            <div className="col-md-5">
              <div className="artist-info__social">
                <div className="artist-info__social_twitter"><i className="fab fa-twitter"></i> <a href="https://twitter.com/nineinchnails" target="_blank">@nin</a></div>
                <div className="artist-info__social_instagram"><i className="fab fa-instagram"></i> <a href="https://instagram.com/nineinchnails" target="_blank">#nineinchnails</a></div>
              </div>
            </div>
          </div>
        </div>
    );
  }
}
