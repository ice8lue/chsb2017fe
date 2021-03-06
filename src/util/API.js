const handleCallResult = res => {
  return Promise[(res.status >= 200 && res.status <= 204) || res.status === 0 ? 'resolve' : 'reject'](res);
};

const api = {

  /**
   * Updates a OSM node.
   *
   * @param {int} nodeID
   * @param {object} data - The new OSM node data
   * @return {Promise} The update action.
   */
  updateNode: ({nodeID, data}) => {
    const updateRequest = new Request(`https://www.openstreetmap.org/api/0.6/node/${nodeID}`, {
        method: 'PUT',
        body: data
      }
    )

    return fetch(updateRequest)
  },

  /**
   * Get a OSM node.
   *
   * @param {int} nodeID
   * @return {Promise} The action.
   */
  getNode: ({nodeID}) => {
    const getRequest = new Request(`https://www.openstreetmap.org/api/0.6/node/${nodeID}`, {
      method: 'GET'
    })

    return fetch(getRequest)
      .then(handleCallResult)
      .then((response) => {
        return response.text()
      })
      .catch((err) => {
        console.error(err);
        return ''
      })
  },

  /**
   * Gets the OSM data for a given rectangle.
   *
   * @param {float} south
   * @param {float} west
   * @param {float} north
   * @param {float} east
   * @return {Promise} a promise that will return the json data as array
   */
  getNodesForMap: ({filters, south, west, north, east}) => {
    const nodes = filters.map(filter => {
      return `node ["${filter}"="yes"] (${south},${west},${north},${east});`;
    });

    const query = `[out:json]
      [timeout:25]
      ;
      (
        ${nodes.join('\n')}
      );
      out;
      >;
      out skel qt;`

    const queryRequest = new Request('http://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: query
    });

    return fetch(queryRequest)
      .then(handleCallResult)
      .then((result) => {
        return result.json()
      })
      .catch((err) => {
        console.error(err);
        return []
      })
  }

}

export default api