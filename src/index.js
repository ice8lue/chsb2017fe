import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import 'babel-polyfill';
import 'normalize.css';
import './style/index.scss';

import LocationProvider from './util/LocationProvider';

import AppContainer from './components/AppContainer';
import AddButton from './components/AddButton';
import FilterButton from './components/FilterButton';
import Overlay from './components/Overlay';
import Map from './components/Map';

const Locator = new LocationProvider();

class App extends Component {
  constructor (props) {
    super(props);

    this.state = {
      location: Locator.get()
    };

    Locator.onChange(this.updateLocation.bind(this));
  }

  updateLocation (location) {
    this.setState({ location });
  }

  render () {
    return (
      <AppContainer>
        <Map longitude={ this.state.location.longitude } latitude={ this.state.location.latitude } />
        <FilterButton />
        <AddButton />  
      </AppContainer>
    );
  }
}

ReactDOM.render(<App />, document.querySelector('.container'));
