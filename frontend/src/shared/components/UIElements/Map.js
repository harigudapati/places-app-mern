import React, { useEffect, useRef } from 'react'
import './Map.css'

const Map = (props) => {
  const mapRef = useRef()
  const { center, zoom } = props

  useEffect(() => {
    new window.ol.Map({
      target: mapRef.current.id,
      layers: [
        new window.ol.layer.Tile({
          source: new window.ol.source.OSM()
        })
      ],
      view: new window.ol.View({
        center: window.ol.proj.fromLonLat([center.lng, center.lat]),
        zoom
      })
    })
  }, [center, zoom])

  // ****** The following is used for google maps api *****
  // useEffect(() => {
  //   const map = new window.google.maps.Map(mapRef.current, {
  //     center,
  //     zoom
  //   })
  //   new window.google.maps.Marker({ position: center, map })
  // }, [center, zoom])

  return <div ref={mapRef} className={`map ${props.className}`} style={props.style} id='map' />
}

export default Map
