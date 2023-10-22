'use client';

import useSWR from 'swr';
import * as turf from '@turf/turf';
import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { StyleExpression } from 'maplibre-gl';

// A.
// SETUP INITIAL STATE

const initialMapState = {
  style: 'map',
  auto_zoom: null,
  selected_coordinates: null,
  selected_feature: null,
};

const initialEntitiesState = {
  pattern_id: null,
  shape_id: null,
  vehicle_id: null,
  trip_id: null,
  //
  stop: null,
  trip: null,
  pattern: null,
  shape: null,
  vehicle: null,
  showSolution: false,
};

// B.
// CREATE CONTEXTS

const StopsExplorerContext = createContext(null);

// C.
// SETUP CUSTOM HOOKS

export function useStopsExplorerContext() {
  return useContext(StopsExplorerContext);
}

// D.
// SETUP PROVIDER

export function StopsExplorerContextProvider({ children }) {
  //

  //
  // A. Setup state

  const [mapState, setMapState] = useState(initialMapState);
  const [entitiesState, setEntitiesState] = useState(initialEntitiesState);

  //
  // B. Fetch data

  const { data: allStopsData } = useSWR('https://api.carrismetropolitana.pt/stops');

  //
  // C. Supporting functions

  const updateWindowUrl = (stopId = 'all', stopName = 'Carris Metropolitana') => {
    //const newUrl = `/stops/${stopId}`;
    //window.history.replaceState({ ...window.history.state, as: newUrl, url: newUrl }, '', newUrl);
    //document.title = stopName;
  };

  //
  // D. Setup actions

  const updateMapState = useCallback(
    (newMapState, reset = false) => {
      if (reset) setMapState({ ...initialMapState, ...newMapState });
      else setMapState({ ...mapState, ...newMapState });
    },
    [mapState]
  );

  const updateEntities = useCallback(
    (newEntitiesState, reset = false) => {
      if (reset) setEntitiesState({ ...initialEntitiesState, ...newEntitiesState });
      else setEntitiesState({ ...entitiesState, ...newEntitiesState });
    },
    [entitiesState]
  );

  // --------

  const setSelectedCoordinates = useCallback((newCoordinates) => {
    setEntitiesState(initialEntitiesState);
    setMapState((prev) => ({ ...prev, selected_coordinates: newCoordinates, selected_feature: null }));
  }, []);

  const setSelectedFeature = useCallback((newFeature) => {
    setMapState((prev) => ({ ...prev, selected_feature: newFeature, selected_coordinates: null }));
  }, []);

  const disableAutoZoom = useCallback(() => {
    setMapState((prev) => ({ ...prev, auto_zoom: false }));
  }, []);

  // --------

  const selectInitialStop = useCallback(
    (stopId = false) => {
      var foundStop = null;
      console.log(allStopsData);
      if (stopId) {
        foundStop = allStopsData.find((item) => item.id === stopId);
      }
      else {
/*         if (allStopsData){
          foundStop=allStopsData[Math.floor(Math.random()*allStopsData.length)];
        } */
      }
      console.log(foundStop);
      if (foundStop) {
        setEntitiesState({ ...initialEntitiesState, stop: foundStop });
        console.log(entitiesState);
        console.log(entitiesState.stop);
      }
    },
    [allStopsData]
  );

  const selectStop = useCallback(
    (stopId, existingStop) => {
      const foundStop = allStopsData.find((item) => item.id === stopId);
      if (foundStop) {
        console.log(entitiesState);
        console.log(entitiesState.stop);
        console.log(mapState);
        var correct_coordinates = turf.point([existingStop.lon, existingStop.lat]);
        var user_coordinates = turf.point([foundStop.lon, foundStop.lat]);
        var distance = turf.distance(correct_coordinates, user_coordinates, {}) * 1000;
        console.log(distance);
        var score = 10000;
        if (distance < 1){
          score = 10000;
        }
        else if (distance >= 1 && distance < 200){
          score = 10000-(100*(distance/8));
        }
        else if (distance => 200 && distance <= 500){
          score = 8500-(10*(distance/2));
        }
        else if (distance > 500 && distance <= 1000){
          score = 6625-(10*(distance/8));
        }
        else if (distance > 1000 && distance <= 6375){
          score = 6375-(distance);
        }
        else if (distance > 6375){
          score = 0;
        }
        window.alert("Your score is " + Math.round(score) + " out of 10 000 points.");
        setMapState((prev) => ({ ...prev, auto_zoom: true, selected_feature: null, selected_coordinates: null }));
        setEntitiesState({ ...entitiesState, stop: existingStop, showSolution: true });
        //updateWindowUrl(stopId, foundStop.name);
      }
    },
    [allStopsData]
  );

  const clearSelectedStop = useCallback(() => {
    setEntitiesState(initialEntitiesState);
    //updateWindowUrl();
  }, []);

  // --------

  const selectTrip = useCallback((tripData) => {
    // setEntitiesState((prev) => ({ ...prev, trip: tripData }));
  }, []);

  const clearSelectedTrip = useCallback(() => {
    setEntitiesState((prev) => ({ ...initialEntitiesState, stop: prev.stop }));
  }, []);

  //
  // E. Setup context object

  const contextObject = useMemo(
    () => ({
      //
      map: mapState,
      updateMap: updateMapState,
      setSelectedCoordinates,
      setSelectedFeature,
      disableAutoZoom,
      //
      entities: entitiesState,
      updateEntities,
      //
      selectStop,
      selectInitialStop,
      clearSelectedStop,
      //
      selectTrip,
      clearSelectedTrip,
    }),
    [mapState, updateMapState, setSelectedCoordinates, setSelectedFeature, disableAutoZoom, entitiesState, updateEntities, selectStop, selectInitialStop, clearSelectedStop, selectTrip, clearSelectedTrip]
  );

  //
  // D. Return provider

  return <StopsExplorerContext.Provider value={contextObject}>{children}</StopsExplorerContext.Provider>;

  //
}
