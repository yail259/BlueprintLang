# BlueprintLang

We can describe complex software systems at various layers of abstraction. Modelling techniques such as C4-flow allow us to integrate structural information as well as behavioural relationships into a unified diagram. Below is a formal implementation of the modelling technique using a YAML based language. It's easily parsable, machine and human readable/editable, and can be visualised with the accompanying web app.

```
# ─────────── NODES ───────────────────────────────────────────
nodes:
  # Context layer
  actor.user:
    label: User
    type: context
    role: actor

  system.collab:
    label: Collab-Docs
    type: context
    role: internalSystem

  # Container layer
  ctr.frontend:
    parent: system.collab
    label: Web Frontend
    type: container
    role: frontend

  ctr.api:
    parent: system.collab
    label: API Gateway
    type: container
    role: api

  ctr.storage:
    parent: system.collab
    label: Doc Storage
    type: container
    role: infra

  # Component layer
  cmp.editorUI:
    parent: ctr.frontend
    label: Editor UI
    type: component
    role: controller

  cmp.docService:
    parent: ctr.api
    label: Doc Service
    type: component
    role: service

  cmp.docRepo:
    parent: ctr.storage
    label: Doc Repo
    type: component
    role: repository

  # Code layer (single illustrative function)
  func.save:
    parent: cmp.docService
    label: save()
    type: code
    role: function

# ──────────────── EDGES ─────────────────────────────────────
edges:
  # 1 ▸ Interaction  (Context → Context)
  ctx_login:
    source: actor.user
    target: system.collab
    type: interaction
    kind: login                 # human-readable purpose
    direction: "->"
    sync: true
    trustBoundary: external
    confidentiality: confidential
    channel: web
    freq: interactive

  # 2 ▸ Protocol  (Container ↔ Container)
  prot_front_to_api:
    source: ctr.frontend
    target: ctr.api
    type: protocol
    kind: request
    tech: REST
    direction: "->"
    sync: true
    auth: userToken
    encryption: TLS
    endPoint: "POST /docs"
    throughput: "5 req/s"
    timeout: "3000 ms"
    retries: 0
    qosTier: bronze

  # 3 ▸ Contract  (Component ↔ Component)
  contract_ui_to_service:
    source: cmp.editorUI
    target: cmp.docService
    type: contract
    kind: command
    direction: "->"
    sync: true
    schema: SaveDoc
    idempotent: false
    version: v1

  # 4 ▸ Data-flow  (Code ↔ Component)
  data_save_to_repo:
    source: func.save
    target: cmp.docRepo
    type: dataflow
    kind: call
    direction: "->"
    sync: true
    datatype: DocEntity
    scope: module
    mutate: true
    returns: boolean
```

One can then parse this language, merging it for example with a json with visual rendering information, to be visualised with the accompanying visualisation tool.

For instance:

```
# ────────── Canonical semantics (tiny test graph) ──────────
nodes:
  actor.user:
    label: User
    type: context
    role: actor

  system.collab:
    label: Collab-Docs
    type: context
    role: internalSystem

edges:
  ctx_login:
    source: actor.user
    target: system.collab
    type: interaction
    kind: login
    direction: "->"
    sync: true
    channel: web
```

```
{
  "nodes": [
    { "id": "actor.user",    "position": { "x": 40,  "y": 60 }, "width": 120, "height": 40 },
    { "id": "system.collab", "position": { "x": 280, "y": 60 }, "width": 160, "height": 60 }
  ],
  "edges": [
    {
      "id": "ctx_login",
      "source": "actor.user",
      "target": "system.collab",
      "markerEnd": { "type": "arrow" },
      "zIndex": 1
    }
  ]
}
```

Combines to make

```
{
  nodes: [
    {
      id: "actor.user",
      data: { label: "User", type: "context", role: "actor" },
      position: { x: 40, y: 60 },
      width: 120,
      height: 40,
      zIndex: 0
    },
    {
      id: "system.collab",
      data: {
        label: "Collab-Docs",
        type: "context",
        role: "internalSystem"
      },
      position: { x: 280, y: 60 },
      width: 160,
      height: 60,
      zIndex: 0
    }
  ],
  edges: [
    {
      id: "ctx_login",
      data: {
        source: "actor.user",
        target: "system.collab",
        type: "interaction",
        kind: "login",
        direction: "->",
        sync: true,
        channel: "web"
      },
      zIndex: 1,
      markerEnd: { type: "arrow" },
      points: undefined
    }
  ]
}
```

Which can be rendered to the following using the accompanying web app Blueprint.

---

You can try to model some problems using the accompanying Blueprint app. It has quite a few rough edges right now and will be incrementally improved along with this spec in the coming days. Hope you find this model, language, and tool useful!
