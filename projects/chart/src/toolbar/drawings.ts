const drawings = [
  {
    icon: 'text',
    name: 'Text',
    items: ['text']
  },
  {
    icon: 'measure',
    name: 'Measure',
    items: [{ className: 'measures', name: 'measure' }]
  },
  {
    icon: 'add-image',
    name: 'Image',
    items: ['image']
  },
  {
    icon: 'chart-market',
    name: 'Chart market',
    items: [
      'dot', 'square', 'diamond', 'arrowUp', 'arrowDown', 'arrowLeft', 'arrowRight', 'arrow', 'note'
    ]
  },
  {
    icon: 'fibonacci',
    name: 'Fibonacci',
    items: [
      'fibonacciArcs', 'fibonacciEllipses',
      'fibonacciRetracements', 'fibonacciFan', 'fibonacciTimeZones', 'fibonacciExtensions'
    ]
  },
  {
    icon: 'geometric',
    name: 'Geometric',
    items: [
      'lineSegment', 'horizontalLine', 'verticalLine',
      'rectangle', 'triangle', 'circle', 'ellipse', 'polygon', 'polyline', 'freeHand', 'cyclicLines'
    ]
  },
  {
    icon: 'trend-channel-drawing',
    name: 'Trend Channel Drawings',
    items: [
      'trendChannel', 'andrewsPitchfork',
      'errorChannel', 'raffRegression', 'quadrantLines',
      'tironeLevels', 'speedLines', 'gannFan', 'trendAngle'
    ]
  },


  // {
  //   icon: 'drawing-baloon',
  //   name: 'General-drawings',
  //   items: ['balloon']
  // },

].map((item: any) => {
  item.items = item.items.map(drawing => {
    if (typeof drawing === 'string')
      return { className: drawing, name: drawing };

    return drawing;
  });
  return item;
});

export default drawings;
