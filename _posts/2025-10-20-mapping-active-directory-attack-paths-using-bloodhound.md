---
date: 2025-10-20 00:00:00
layout: post
title: Mapping Attack Paths Like a Threat Actor (Bloodhound)
subtitle: How Threat Actors Navigate Complex Corporate Active Directory.
description: In complex corporate Active Directory environments, attackers don't guess (they map). Explore how threat actors identify attack paths in enterprise AD.
image: /assets/img/uploads/posts/2025/10/2025-10-20-bloodhound-cover.png
optimized_image: /assets/img/uploads/posts/2025/10/2025-10-20-bloodhound-cover.png
category: active-directory-pentest
tags:
  - lateralmovement
author: xchopath
---

At first, I thought Red Teaming or Assumed Breach engagements were exhausting (having to manually enumerate computers in large corporate environments with hundreds, or even thousands, of hosts). But that assumption didn't last long. BloodHound changed the game almost entirely.

This article should also help if you need a practical guide to installing BloodHound, especially when preparing for Red Team-focused certifications like OSCP, CRTP, PNPT, and more.

## What does BloodHound actually do?

It allows us to map out which attack paths we need to take, identify interesting machines, determine which users are worth targeting, and highlight high-value assets that are worth exploring.

All of this can be done with nothing more than a single domain user account (even one with the lowest possible privileges). From there, we can uncover and visualize misconfiguration paths within Active Directory.

> So, as a prerequisite, to run BloodHound you'll need **at least one compromised domain user**.

## Installation

So, what do we need to prepare? There are two main components.
1. Ingestor, which is responsible for collecting Active Directory data such as machines, users, configurations, and other relevant objects.
2. BloodHound itself, which is used to map and visualize the collected data.

### BloodHound (Visualizer)

For the BloodHound visualizer, I'm using BloodHound Community Edition (CE), which is installed inside Docker using Docker Compose.

From here, we need to prepare a working directory to host the setup. In this case, I'm using a directory named `bloodhound-docker`. After that, download the Docker Compose file and deploy it.

```sh
mkdir ~/bloodhound-docker
```

```sh
cd ~/bloodhound-docker
```

```sh
wget "https://raw.githubusercontent.com/SpecterOps/bloodhound/main/examples/docker-compose/docker-compose.yml"
```

```sh
sudo docker compose up -d --build
```

We can retrieve the **default credentials** generated during the initial installation by running the command below.

```sh
sudo docker compose logs | grep "Initial Password Set"
```

![Bloodhound Credential]({{ "/assets/img/uploads/posts/2025/10/2025-10-20-bloodhound-docker-compose.png" | relative_url }})

Then, log in with the `admin` username and the password generated during installation.

To access BloodHound, you can simply open your browser and navigate to **http://localhost:8080**.

![Access to Bloodhound]({{ "/assets/img/uploads/posts/2025/10/2025-10-20-bloodhound-access.png" | relative_url }})

### Ingestor

For the ingestor, I'll be using **BloodHound.py**. In practice, there are several ingestor options available, such as **SharpHound.ps1** (which can be executed via Windows PowerShell), as well as other alternatives.

Next, we can simply get **BloodHound.py** from its repository and install it using pip.

```sh
git clone --branch bloodhound-ce https://github.com/dirkjanm/BloodHound.py.git
```

```sh
cd BloodHound.py
```

```sh
python3 -m pip install .
```

Once everything is installed, we can **start the enumeration process** using the command below. This command is adjustable, so make sure to tailor it to your machine and environment.

```sh
python3 bloodhound.py -d <DOMAIN> -c All -u '<DOMAIN_USER>' -p '<PASSWORD>' -ns <DC_IP> --zip
```

![BloodHound.py run]({{ "/assets/img/uploads/posts/2025/10/2025-10-20-bloodhound.py-run.png" | relative_url }})

After successfully running the ingestor, the output will be a **.zip** file, which can then be uploaded into BloodHound for attack path mapping.

To upload the **.zip** file, since the BloodHound UI changes frequently, it's easier to go directly to `http://localhost:8080/ui/administration/file-ingest` and upload the file from that page.

![BloodHound.py .zip result]({{ "/assets/img/uploads/posts/2025/10/2025-10-20-bloodhound.py-zip.png" | relative_url }})

Once the data is successfully uploaded, BloodHound will process it and make the visualization available.

## What's an interesting feature in BloodHound that's rarely used?

Most users tend to rely heavily on the **Pathfinding** feature, usually performing simple two-way searches from user A to user B. While this works, it only scratches the surface.

What I personally find more powerful is **Cypher queries**. With Cypher, we can **explore attack paths from a much broader perspective** while keeping the queries simple and flexible. It allows us to see relationships and escalation paths that are easy to miss when relying solely on straight pathfinding.

![Bloodhound Cypher Query]({{ "/assets/img/uploads/posts/2025/10/2025-10-20-bloodhound-cypher-query.png" | relative_url }})

## Closing

By now, it's clear that manual enumeration doesn't scale well. BloodHound fills that gap by allowing red teamers to quickly identify and visualize attack paths in Active Directory during real-world penetration testing.