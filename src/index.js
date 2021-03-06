import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import 'babel-polyfill';
import 'normalize.css';
import './style/index.scss';
import api from './util/API';

import LocationProvider from './util/LocationProvider';
import AppContainer from './components/AppContainer';
import PositionButton from './components/PositionButton';
import FilterButton from './components/FilterButton';
import SearchButton from './components/SearchButton';
import Overlay from './components/Overlay';
import DetailView from './components/DetailView';
import FilterView from './components/FilterView';
import Map from './components/Map';
import MapMarker, {MARKER_TYPES} from './components/MapMarker';

const Locator = new LocationProvider();
const isDay = () => {
  const hours = new Date().getHours()
  return hours > 6 && hours < 20
};

// native stuff
if (window.cordova) {
  document.documentElement.classList.add('native');
  document.documentElement.classList.add(window.cordova.platformId);

  const onDeviceReady = () => {
    // StatusBar adjustments
    if (window.StatusBar) {
      if (window.cordova.platformId === 'android') {
        // set statusbar bg color and apply white font color
        window.StatusBar.backgroundColorByHexString('#673ab7');
        window.StatusBar.styleLightContent();
      } else {
        // set statusbar transparent bg and apply white font color according to day/night theme
        window.StatusBar.overlaysWebView(true);
        window.StatusBar[isDay() ? 'styleDefault' : 'styleLightContent']();
      }
    }
  };

  document.addEventListener('deviceready', onDeviceReady, false);
}


class App extends Component {
  constructor (props) {
    super(props);

    let filters = window.localStorage.getItem('filters');
    filters = filters && JSON.parse(filters) || ['diet:gluten_free', 'diet:vegan'];

    this.state = {
      location: Locator.get(),
      showAddOverlay: false,
      showDetailOverlay: false,
      showSearch: false,
      places: [],
      filters: filters,
      details: {},
      isDay: isDay()
    };

    this.handleMyPositionClick = this.handleMyPositionClick.bind(this);
    this.toggleSearch = this.toggleSearch.bind(this);
    this.handleMapClick = this.handleMapClick.bind(this);
    this.updateLocationManual = this.updateLocationManual.bind(this);
    this.updateFilters = this.updateFilters.bind(this);

    Locator.onChange(this.updateLocation.bind(this));
  }

  handleMyPositionClick () {
    Locator.switchToAutomaticMode();
  }

  handleMapClick () {
    this.setState({
      showDetailOverlay: false,
      showFilterOverlay: false
    });
  }

  renderMarkers (place) {
    return (
      <MapMarker
        key={place.id}
        position={{ lat: place.lat, lng: place.lon}}
        tags={place.tags}
        onClick={() => this.setState({
          showDetailOverlay: true,
          showFilterOverlay: false,
          details: place.tags
        })}
        type={MARKER_TYPES.Bakery}
      />
    )
  }

  toggleSearch () {
    this.setState({showSearch: !this.state.showSearch, showDetailOverlay: false, showFilterOverlay: false});
  }

  updateLocation (location) {
    this.setState({ location });
    this.updatePlaces();
  }

  updatePlaces () {
    api.getNodesForMap({
      filters: this.state.filters,
      south: this.state.location.latitude - 0.5,
      west: this.state.location.longitude - 0.5,
      north: this.state.location.latitude + 0.5,
      east: this.state.location.longitude + 0.5
    }).then((data) => {
      this.setState({places: data.elements || []})
    });
  }

  updateLocationManual (lat, lng) {
    Locator.switchToManualMode(lat, lng);
  }

  updateFilters (filters) {
    this.setState({ filters });
    window.localStorage.setItem('filters', JSON.stringify(filters))
    this.updatePlaces();
  }

  render () {
    const {latitude, longitude} = this.state.location
    return (
      <AppContainer>
        <Map showSearch={this.state.showSearch} onLatLngChange={this.updateLocationManual} onClick={this.handleMapClick} longitude={this.state.location.longitude} latitude={this.state.location.latitude} isDay={this.state.isDay} >
          <MapMarker
            position={{lat: latitude, lng: longitude}} type='Location'/>
            {
              this.state.places.map((place) => this.renderMarkers(place))
            }
            type={MARKER_TYPES.Location}
        </Map>

        <SearchButton onClick={this.toggleSearch}/>
        <FilterButton onClick={() => this.setState({ showFilterOverlay: !this.state.showFilterOverlay })} />
        {this.state.showAddOverlay === true && <AddView /> }
        {this.state.showFilterOverlay === true && <FilterView filters={this.state.filters} onUpdate={this.updateFilters} /> }
        {this.state.showDetailOverlay === true && <DetailView data={this.state.details} onClose={this.handleMapClick} /> }
        <PositionButton onClick={this.handleMyPositionClick} />
      </AppContainer>
    );
  }
}

ReactDOM.render(<App />, document.querySelector('.container'));
