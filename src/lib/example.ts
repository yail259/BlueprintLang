export const exampleYaml = `
nodes:
  actor.user:
    label: User
    c4Type: context
    role: actor
  system.collab:
    label: Collab-Docs
    c4Type: context
    role: internalSystem
edges:
  ctx_login:
    source: actor.user
    target: system.collab
    c4FlowType: interaction
    kind: login
    direction: '->'
    sync: true
    channel: web

`;

export const exampleJSON = `
{
  "nodes": [
    {
      "id": "actor.user",
      "position": {
        "x": -363.8703496364186,
        "y": 393.259115525036
      },
      "type": "c4FlowNode",
      "width": 124,
      "height": 69,
      "zIndex": 0
    },
    {
      "id": "system.collab",
      "position": {
        "x": 137.45257452574526,
        "y": 394.07859078590786
      },
      "type": "c4FlowNode",
      "width": 160,
      "height": 60,
      "zIndex": 0
    }
  ],
  "edges": [
    {
      "id": "ctx_login",
      "source": "actor.user",
      "target": "system.collab",
      "zIndex": 1,
      "markerEnd": {
        "type": "arrow"
      }
    }
  ]
}
`;
