---
config:
  layout: elk
  look: handDrawn
  theme: neutral
---
flowchart TB
 subgraph subGraph0["Control Plane"]
    direction TB
        Orchestrator("Orchestrator")
        ControlGateway("Nginx <br> Control Gateway")
        ControlDB[("Control DB")]
        Frontend[("Static <br>React Files")]
  end
 subgraph LocustWorkers["Locust Workers"]
    direction LR
        LocustWorker2("Worker2")
        LocustWorker3("WorkerN")
        LocustWorker1("Worker1")
  end
 subgraph subGraph2["Load Generator"]
    direction LR
        LoadAPIServer("Load API Server")
        LoadVolume[("Load State <br>Volume")]
        LocustManager("Locust Manager")
        LocustWorkers
  end
 subgraph UvicornWorkers["FastAPI Uvicorn Workers"]
    direction LR
        Uvicorn2("Worker2")
        Uvicorn3("WorkerN")
        Uvicorn1("Worker1")
  end
 subgraph APIServer["Monolith API Server"]
        Gunicorn("Gunicorn <br> App Manager")
        UvicornWorkers
  end
 subgraph subGraph4["System Under Test"]
        SUTGateway("Nginx <br> SUT Gateway")
        APIServer
  end
 subgraph AgentsBox["Agents"]
        ControlAgent("Control Agent")
        Promtail("Promtail")
        NginxExporter("NginxExporter")
        NodeExporter("NodeExporter<br>(System Resources)")
        StatsExporter("ContainerStatsExporter <br>(Docker Resource Stats)")
  end
 subgraph subGraph6["Backend Stack"]
    direction TB
        SecureGateway("Nginx <br> Controller Gateway")
        ObservabilityGateway("Nginx <br> Observability Gateway")
        AgentsBox
        subGraph4
  end
 subgraph Databases["Databases"]
    direction TB
        Prometheus("Prometheus")
        Loki("Loki")
        Tempo("Tempo")
        Pyroscope("Pyroscope")
  end
 subgraph subGraph8["Observability Stack"]
    direction TB
        Databases
        Grafana("Grafana")
        Dashboards("Dashboard <br> Json Files")
  end
    Engineer["Engineer"] -- Accesses Control Panel --> ControlGateway
    ControlGateway -- Serves Control Panel --> Frontend
    ControlGateway -- (User Path) <br> Forwards /sut Requests --> SUTGateway
    ControlGateway -- Forwards <br>Data Requests --> Grafana
    ControlGateway -- Forwards Control Requests --> Orchestrator
    Orchestrator -- Pushes test configs --> LoadAPIServer
    Orchestrator -- (Secure Path) <br> Sends /control Requests --> SecureGateway
    SecureGateway -- Forwards <br>/control Requests --> ControlAgent
    LocustWorkers -- Forwards /sut Requests --> SUTGateway
    LocustManager -- Coordinates Workers --> LocustWorkers
    SUTGateway -- Forwards /sut Requests --> Gunicorn
    Gunicorn -- Coordiates Workers --> UvicornWorkers
    Gunicorn -- Writes <br>Logs --> Promtail
    UvicornWorkers -- Writes <br>Logs --> Promtail
    UvicornWorkers -- Stores <br>Traces --> Tempo
    UvicornWorkers -- Stores <br>Profiles --> Pyroscope
    ControlAgent -- Executes <br>Commands --> Gunicorn
    NginxExporter -- Scrapes <br>stub_status --> SUTGateway
    Promtail -- Stores <br>Logs --> Loki
    Prometheus --  (observability path)<br>Scrapes /metrics --> ObservabilityGateway
    ObservabilityGateway -- Forwards <br>/metrics requests --> Gunicorn & NginxExporter
    Grafana -- Loads Dashboards --> Dashboards
    Grafana -- Queries Metrics --> Prometheus
    Grafana -- Queries Logs --> Loki
    Grafana -- Queries Traces --> Tempo
    Grafana -- Queries Profiles --> Pyroscope
    Orchestrator -- Queries <br>Control Data --> ControlDB
    LoadAPIServer -- Creates / Manages --> LocustManager
    LoadAPIServer -- Reads / Writes / Deletes <br> State --> LoadVolume
    ObservabilityGateway -- Forwards <br>/metrics requests --> StatsExporter & NodeExporter
     Orchestrator:::control
     ControlGateway:::control
     ControlDB:::control
     Frontend:::control
     LocustWorker2:::load
     LocustWorker3:::load
     LocustWorker1:::load
     LocustManager:::load
     LoadAPIServer:::load
     LoadVolume:::load
     Uvicorn2:::sut
     Uvicorn3:::sut
     Uvicorn1:::sut
     Gunicorn:::sut
     SUTGateway:::sut
     ControlAgent:::agent
     Promtail:::agent
     NginxExporter:::agent
     SecureGateway:::sut
     ObservabilityGateway:::sut
     Prometheus:::o11y
     Loki:::o11y
     Tempo:::o11y
     Pyroscope:::o11y
     Grafana:::o11y
     Dashboards:::o11y
     Engineer:::user
     NodeExporter:::agent
     StatsExporter:::agent
    classDef sut fill:#ADD8E6,stroke:#00008B,stroke-width:2px,color:#000
    classDef agent fill:#FFFFFF,stroke:#000000,stroke-width:2px,color:#000
    classDef o11y fill:#90EE90,stroke:#006400,stroke-width:2px,color:#000
    classDef user fill:#FFFACD,stroke:#DAA520,stroke-width:2px,color:#000
    classDef load fill:#FFCCCC,stroke:#FF0000,stroke-width:2px,color:#000
    classDef control fill:#e4c6e4,stroke:#be4fc0,stroke-width:2px,color:#000
    classDef dotted_box stroke-dasharray: 5 5,stroke-width:2px,stroke:#000
    style AgentsBox color:#000000
    linkStyle 0 stroke:#DAA520,stroke-width:3px,fill:none
    linkStyle 1 stroke:#be4fc0,stroke-width:3px,fill:none
    linkStyle 2 stroke:#be4fc0,stroke-width:3px,fill:none
    linkStyle 3 stroke:#be4fc0,stroke-width:3px,fill:none
    linkStyle 4 stroke:#be4fc0,stroke-width:3px,fill:none
    linkStyle 5 stroke:#be4fc0,stroke-width:3px,fill:none
    linkStyle 6 stroke:#be4fc0,stroke-width:3px,fill:none
    linkStyle 7 stroke:#00008B,stroke-width:3px,fill:none
    linkStyle 8 stroke:#FF0000,stroke-width:3px,fill:none
    linkStyle 9 stroke:#FF0000,stroke-width:3px,fill:none
    linkStyle 10 stroke:#00008B,stroke-width:3px,fill:none
    linkStyle 11 stroke:#00008B,stroke-width:3px,fill:none
    linkStyle 12 stroke:#00008B,stroke-width:3px,fill:none
    linkStyle 13 stroke:#00008B,stroke-width:3px,fill:none
    linkStyle 14 stroke:#00008B,stroke-width:3px,fill:none
    linkStyle 15 stroke:#00008B,stroke-width:3px,fill:none
    linkStyle 16 stroke:#000000,stroke-width:3px,fill:none
    linkStyle 17 stroke:#000000,stroke-width:3px,fill:none
    linkStyle 18 stroke:#006400,stroke-width:3px,fill:none
    linkStyle 19 stroke:#006400,stroke-width:3px,fill:none
    linkStyle 20 stroke:#00008B,stroke-width:3px,fill:none
    linkStyle 21 stroke:#00008B,stroke-width:3px,fill:none
    linkStyle 22 stroke:#006400,stroke-width:3px,fill:none
    linkStyle 23 stroke:#006400,stroke-width:3px,fill:none
    linkStyle 24 stroke:#006400,stroke-width:3px,fill:none
    linkStyle 25 stroke:#006400,stroke-width:3px,fill:none
    linkStyle 26 stroke:#006400,stroke-width:3px,fill:none
    linkStyle 27 stroke:#be4fc0,stroke-width:3px,fill:none
    linkStyle 28 stroke:#FF0000,stroke-width:3px,fill:none
    linkStyle 29 stroke:#FF0000,stroke-width:3px,fill:none
    linkStyle 30 stroke:#00008B,stroke-width:3px,fill:none
    linkStyle 31 stroke:#00008B,stroke-width:3px,fill:none

