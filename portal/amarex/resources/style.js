const abimoStyleList = [
  {
    styleId: "default",
    rules: [
      {
        style: {
          polygonStrokeWidth: 2,
          polygonStrokeColor: [84, 187, 168, 1],
          polygonFillColor: [0, 0, 0, 0],
        },
      },
    ],
  },
  {
    styleId: "abimo_selected",
    rules: [
      {
        style: {
          polygonStrokeWidth: 2,
          polygonStrokeColor: [84, 187, 168, 1],
          polygonFillColor: [84, 187, 168, 0.5],
        },
      },
    ],
  },
  {
    styleId: "abimo_result_infiltration",
    rules: [
      {
        style: {
          polygonStrokeWidth: 2,
          polygonStrokeColor: [84, 187, 168, 1],
        },
      },
      {
        conditions: {
          properties: {
            infiltr: [-400, 0],
          },
        },
        style: {
          polygonFillColor: [255, 255, 255, 1],
        },
      },
      {
        conditions: {
          properties: {
            infiltr: [0, 60],
          },
        },
        style: {
          polygonFillColor: [220, 250, 240, 1],
        },
      },
      {
        conditions: {
          properties: {
            infiltr: [60, 80],
          },
        },
        style: {
          polygonFillColor: [190, 240, 220, 1],
        },
      },
      {
        conditions: {
          properties: {
            infiltr: [80, 100],
          },
        },
        style: {
          polygonFillColor: [150, 230, 200, 1],
        },
      },
      {
        conditions: {
          properties: {
            infiltr: [100, 120],
          },
        },
        style: {
          polygonFillColor: [120, 220, 180, 1],
        },
      },
      {
        conditions: {
          properties: {
            infiltr: [120, 140],
          },
        },
        style: {
          polygonFillColor: [90, 210, 160, 1],
        },
      },
      {
        conditions: {
          properties: {
            infiltr: [140, 160],
          },
        },
        style: {
          polygonFillColor: [60, 200, 140, 1],
        },
      },
      {
        conditions: {
          properties: {
            infiltr: [160, 180],
          },
        },
        style: {
          polygonFillColor: [40, 180, 120, 1],
        },
      },
      {
        conditions: {
          properties: {
            infiltr: [180, 200],
          },
        },
        style: {
          polygonFillColor: [20, 160, 100, 1],
        },
      },
      {
        conditions: {
          properties: {
            infiltr: [200, 220],
          },
        },
        style: {
          polygonFillColor: [10, 140, 80, 1],
        },
      },
      {
        conditions: {
          properties: {
            infiltr: [220, 240],
          },
        },
        style: {
          polygonFillColor: [10, 120, 70, 1],
        },
      },
      {
        conditions: {
          properties: {
            infiltr: [240, 260],
          },
        },
        style: {
          polygonFillColor: [10, 100, 50, 1],
        },
      },
      {
        conditions: {
          properties: {
            infiltr: [260, 280],
          },
        },
        style: {
          polygonFillColor: [10, 80, 40, 1],
        },
      },
      {
        conditions: {
          properties: {
            infiltr: [280, 300],
          },
        },
        style: {
          polygonFillColor: [0, 60, 30, 1],
        },
      },
      {
        conditions: {
          properties: {
            infiltr: [300, 400],
          },
        },
        style: {
          polygonFillColor: [0, 50, 20, 1],
        },
      },
      {
        conditions: {
          properties: {
            infiltr: [400, 500],
          },
        },
        style: {
          polygonFillColor: [0, 30, 10, 1],
        },
      },
      {
        conditions: {
          properties: {
            infiltr: [500, 800],
          },
        },
        style: {
          polygonFillColor: [0, 0, 0, 1],
        },
      },
    ],
  },
  {
    styleId: "abimo_result_evaporation",
    rules: [
      {
        style: {
          polygonStrokeWidth: 2,
          polygonStrokeColor: [84, 187, 168, 1],
        },
      },
      {
        conditions: {
          properties: {
            evapor: [0, 50],
          },
        },
        style: {
          polygonFillColor: [255, 255, 255, 1],
        },
      },
      {
        conditions: {
          properties: {
            evapor: [50, 100],
          },
        },
        style: {
          polygonFillColor: [220, 240, 255, 1],
        },
      },
      {
        conditions: {
          properties: {
            evapor: [100, 120],
          },
        },
        style: {
          polygonFillColor: [180, 210, 255, 1],
        },
      },
      {
        conditions: {
          properties: {
            evapor: [120, 140],
          },
        },
        style: {
          polygonFillColor: [140, 190, 255, 1],
        },
      },
      {
        conditions: {
          properties: {
            evapor: [140, 160],
          },
        },
        style: {
          polygonFillColor: [100, 170, 255, 1],
        },
      },
      {
        conditions: {
          properties: {
            evapor: [160, 180],
          },
        },
        style: {
          polygonFillColor: [70, 150, 240, 1],
        },
      },
      {
        conditions: {
          properties: {
            evapor: [180, 200],
          },
        },
        style: {
          polygonFillColor: [50, 130, 220, 1],
        },
      },
      {
        conditions: {
          properties: {
            evapor: [200, 220],
          },
        },
        style: {
          polygonFillColor: [30, 110, 210, 1],
        },
      },
      {
        conditions: {
          properties: {
            evapor: [220, 240],
          },
        },
        style: {
          polygonFillColor: [20, 90, 200, 1],
        },
      },
      {
        conditions: {
          properties: {
            evapor: [240, 260],
          },
        },
        style: {
          polygonFillColor: [10, 70, 180, 1],
        },
      },
      {
        conditions: {
          properties: {
            evapor: [260, 280],
          },
        },
        style: {
          polygonFillColor: [10, 60, 160, 1],
        },
      },
      {
        conditions: {
          properties: {
            evapor: [280, 300],
          },
        },
        style: {
          polygonFillColor: [0, 50, 140, 1],
        },
      },
      {
        conditions: {
          properties: {
            evapor: [300, 400],
          },
        },
        style: {
          polygonFillColor: [0, 40, 100, 1],
        },
      },
      {
        conditions: {
          properties: {
            evapor: [400, 500],
          },
        },
        style: {
          polygonFillColor: [0, 20, 80, 1],
        },
      },
      {
        conditions: {
          properties: {
            evapor: [500, 600],
          },
        },
        style: {
          polygonFillColor: [0, 0, 50, 1],
        },
      },
    ],
  },
  {
    styleId: "abimo_result_surface_run_off",
    rules: [
      {
        style: {
          polygonStrokeWidth: 2,
          polygonStrokeColor: [84, 187, 168, 1],
        },
      },
      {
        conditions: {
          properties: {
            runoff: [0, 50],
          },
        },
        style: {
          polygonFillColor: [255, 255, 255, 1],
        },
      },
      {
        conditions: {
          properties: {
            runoff: [50, 100],
          },
        },
        style: {
          polygonFillColor: [255, 230, 230, 1],
        },
      },
      {
        conditions: {
          properties: {
            runoff: [100, 150],
          },
        },
        style: {
          polygonFillColor: [255, 200, 200, 1],
        },
      },
      {
        conditions: {
          properties: {
            runoff: [150, 200],
          },
        },
        style: {
          polygonFillColor: [255, 170, 170, 1],
        },
      },
      {
        conditions: {
          properties: {
            runoff: [200, 250],
          },
        },
        style: {
          polygonFillColor: [255, 140, 140, 1],
        },
      },
      {
        conditions: {
          properties: {
            runoff: [250, 270],
          },
        },
        style: {
          polygonFillColor: [240, 110, 110, 1],
        },
      },
      {
        conditions: {
          properties: {
            runoff: [270, 290],
          },
        },
        style: {
          polygonFillColor: [230, 90, 90, 1],
        },
      },
      {
        conditions: {
          properties: {
            runoff: [290, 310],
          },
        },
        style: {
          polygonFillColor: [220, 70, 70, 1],
        },
      },
      {
        conditions: {
          properties: {
            runoff: [310, 330],
          },
        },
        style: {
          polygonFillColor: [210, 50, 50, 1],
        },
      },
      {
        conditions: {
          properties: {
            runoff: [330, 350],
          },
        },
        style: {
          polygonFillColor: [200, 40, 40, 1],
        },
      },
      {
        conditions: {
          properties: {
            runoff: [350, 370],
          },
        },
        style: {
          polygonFillColor: [180, 30, 30, 1],
        },
      },
      {
        conditions: {
          properties: {
            runoff: [370, 390],
          },
        },
        style: {
          polygonFillColor: [160, 20, 20, 1],
        },
      },
      {
        conditions: {
          properties: {
            runoff: [390, 410],
          },
        },
        style: {
          polygonFillColor: [140, 10, 10, 1],
        },
      },
      {
        conditions: {
          properties: {
            runoff: [410, 450],
          },
        },
        style: {
          polygonFillColor: [100, 0, 0, 1],
        },
      },
      {
        conditions: {
          properties: {
            runoff: [450, 500],
          },
        },
        style: {
          polygonFillColor: [80, 0, 0, 1],
        },
      },
      {
        conditions: {
          properties: {
            runoff: [500, 600],
          },
        },
        style: {
          polygonFillColor: [50, 0, 0, 1],
        },
      },
    ],
  },
];

export default abimoStyleList;

