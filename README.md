# BlueprintLang

We can describe complex software systems at various layers of abstraction. BlueprintLang is a YAML based language which codifies such descriptions and allows you render them into visual diagrams with accompanying tooling. It's easily parsable, machine and human readable/editable, expressive and hackable. 

For instance, modelling techniques such as [C4-flow](https://github.com/yail259/C4-Flow) allow us to integrate structural information as well as behavioural relationships into a unified diagram and provides 4 layers of abstraction. This can be easily represented in BlueprintLang and capture software architecture in a powerful, intuitive way.

```
# ─────────── NODES ───────────────────────────────────────────
nodes:
  # all nodes must have a unique id
  id:
    label: A display friendly name, can be the same or different to id.
    type: >
		The type of the node, for example 'context' in C4-Flow. Can be used to filter the view.
    kind?: An optional additional high level description, e.g. 'user'.
	comment?: An optional natural language description.

# ──────────────── EDGES ─────────────────────────────────────
edges:
  # all edges must have a unique id
  id:
    source: id of the node initiating interaction or emitting data.
    target: id of the node handling interaction or accepting data.
    type: The type of the edge, for example 'interaction' in C4-Flow. Can be used to filter the view.
    kind?: An optional additional high level description, e.g. 'user'.
    sync?: A boolean of whether the interaction is synchronous
    <any>?: Any additional parameters can be attached as extension data in terms of usefulness in domain. See below for some examples based on C4-Flow model:

# Example Edges
# 1 ▸ Interaction  (Context → Context)
  ctx_login:
    source: actor.user
    target: system.collab
    c4FlowType: interaction
    kind: login            
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

One can then parse this language, merging it with a file containing visual rendering information (such as a JSON), to be visualised in any visualisation tool. Below shows the inner workings of how the accompanying BlueprintCode web app renders the graph under the hood, but it's implementation agnostic so you can build your own renderer if needed!

For instance:

```
# ────────── Canonical semantics (tiny test graph) ──────────
nodes:
  actor.user:
    label: User
    type: context
    kind: actor

  system.collab:
    label: Collab-Docs
    type: context
    kind: internalSystem

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


---

You can try to model some problems using the accompanying Blueprint app. It has quite a few rough edges right now and will be incrementally improved along with this spec in the coming days. Hope you find this model, language, and tool useful!
