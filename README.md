# Multiple Deployment w/ Docker Compose

## Motivation

I wanted to demo a simple way to enable deploying different versions
of the same app, on the same host/cluster, via `docker-compose`.

This is pretty useful when you need to "_test in production_", or even better,
when you want to run both _canary_ and _stable_ channels.

## What this repo demos

This repo contains a pretty basic Express app (with just one method), running behind an Nging reverse proxy, described in a `docker-compose.yml` file.

By running some scripts, you can run two versions __side by side__, and make
changes to them independently.

Additionally, this branch features a custom logic that lets the user pick either channels through a simple Web page.

## What is missing

__This used to be a limitation of the original version, but it solved in this branch__

~~Being a simple demo, you will actually need to hit two different HTTP ports in order
to reach either of two versions. In more advanced scenarios, like _canary_ and _stable_ channels,
will need to make this "selection" __transparent__ for the end user.~~

~~One easy way to achieve that is to put an additional _reverse proxy_ in front
of both versions, and let it re-route users based on some custom logic. For instance,
you might assign _canary users_ an additional cookie during the login phase and
then they will hit the _canary_ version of the app when Nginx filters and proxies
their requests.~~

This a __stateless__ app, meaning it doesn't manage or access any data,
like databases. If you need to account for those as well (like _always_ in the real world),
there are some challenges you need to be aware of: first, you surely can add more images and
containers for them, but those __will not__ include all the data the app will likely
need to run. __Sharing the same data is NOT an option__, so you will probably need a way
to set it up, like performing a backup and restore script (if are leveraging MongoDB or SQL Server,
it is pretty straightforward).

Finally, once again, this is a __basic, simple__ demo, so it has a lot of room
for improvement _by design_. You are looking for a much more complete, and complex,
example app, you should watch this repo [https://github.com/dotnet-architecture/eShopOnContainers](https://github.com/dotnet-architecture/eShopOnContainers).

## Requirements

For you machine:

- Docker (tested with v17.06)

I build this demo on Windows 10 v1703, but it should on Linux and Mac as well - just
notice the two scripts might have to be edited/renamed to work in `bash`/`sh`.

From a "developer" perspective, you should have a fair understading of:

- Containers
- Basic Docker usage (ex. `dockerfile`)
- NodeJS and Express (just for the app)
- What a _reverse proxy_ is
- Some _nginx_ knowledge is helpful, on this branch

## Instructions

1. Open a shell prompt (on Windows, either `cmd.exe` or `powershell`), so you do not miss any output in case of issues.

1. Start `InstallGlobalNetwork.cmd`. This creates a shared network for all apps and the version selector proxy to communicate.

1. Run `RunSelector.cmd`. This start the version selector proxy on port 9000.

1. Start `RunStable.cmd`

1. Now start `RunCanary.cmd`.

1. Open your browser and navigate to [http://localhost:9999](http://localhost:9999). By default, you will hit the stable channel, and get a basic JSON response.

1. Navigate to [http://localhost:9999/control-panel](http://localhost:9999/control-panel). This page lets you choose either channels, and see that the API response changes, even if the URL is the same.

1. Just like the `master` branch version, you can make changes to either channels and see those affecting only one app, and never both.

## Shutting down

1. `docker-compose -p myapp down`
1. `docker-compose -p myapp_canary down`
1. `docker-compose -f version-selector.yml down`

1. You might also want to remove the `global` network, via `docker network rm global`

## How it works

First of all, we have our regular `docker-compose.yml` file. However, if you read it carefully, you'll notice an important section is missing: `nginx` service has is `ports` section missing.

That is actually found in the other two files, `docker-compose.stable.yml` and `docker-compose.canary.yml`, that override the default configuration by setting each a different mapping.

However, this is __not__ enough to achieve our goal, since Docker has still no way to distinguish two versions of the same images.

Fortunately, there's another option you can supply to `docker-compose`, the `--project-name` (short `-p`) argument. If you take a look at both scripts, you'll notice that we're using two different values, `myapp` in production, and `myapp_canary` otherwise.

Indeed, this makes Docker deploy two different apps in practice. So, the two commands are simply:

- `docker-compose -p myapp -f docker-compose.yml -f docker-compose.stable.yml up -d --build`
- `docker-compose -p myapp_test -f docker-compose.yml -f docker-compose.canary.yml up -d --build`

Additionally, on top the default version of this repo, we leverage __a common, shared network__, called `global`, among the two app channels and the version selector. This network is marked `external`, and needs to be created beforehand, to enable all these three containers to reach themselves.

Finally, one more image, handled by the `version-selector.yml` Docker Compose file, builds a third reverse-proxy that does the trick: it inspects the `CHANNEL` cookie and redirects accordingly to the corresponding channel proxy.

```nginx
    upstream stable {
        server myapp_nginx_1;
    }
    upstream canary {
        server myappcanary_nginx_1;
    }
    map $cookie_CHANNEL $app {
        default prod;

        stable stable;
        canary canary;
    }
```

## References

- StackOverflow - ["Controlling Nginx proxy target using a cookie?"](https://serverfault.com/questions/268633/controlling-nginx-proxy-target-using-a-cookie)

- Docker Docs - [Networking in Compose](https://docs.docker.com/compose/networking/)

- Docker Docs - [Environment variables in Compose](https://docs.docker.com/compose/environment-variables/) 

- Docker Docs - [Share Compose configurations between files and projects](https://docs.docker.com/compose/extends/)

- Docker Docs - [Using Compose in production](https://docs.docker.com/compose/production/)