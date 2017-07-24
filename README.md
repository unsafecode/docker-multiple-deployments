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

## What is missing

Being a simple demo, you will actually need to hit two different HTTP ports in order
to reach either of two versions. In more advanced scenarios, like _canary_ and _stable_ channels,
will need to make this "selection" __transparent__ for the end user.

One easy way to achieve that is to put an additional _reverse proxy_ in front
of both versions, and let it re-route users based on some custom logic. For instance,
you might assign _canary users_ an additional cookie during the login phase and
then they will hit the _canary_ version of the app when Nginx filters and proxies
their requests.

Additionaly, this a __stateless__ app, meaning it doesn't manage or access any data,
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
  - _nginx_ knowledge isn't really relevant, on the other hand

## Instructions

1. Open a shell prompt (on Windows, either `cmd.exe` or `powershell`), so you do not miss any output in case of issues.

1. Start `RunStable.cmd`

1. Open your browser and navigate to [http://localhost:9001](http://localhost:9001). If everything's OK, you will get a `200 OK` response with some JSON.

1. Now start `RunCanary.cmd`, and hit [http://localhost:9002](http://localhost:9002). The two responses will match, since the app is exactly the same at this point.

1. Let's now make a change to the app and release it to the _test_ channel. Open the `app/index.js`file and change the `VERSION` constant to `"1.0.1"` (or whatever you prefer).

1. Now start `RunCanary.cmd` and hit again [http://localhost:9002](http://localhost:9002)

1. New version should be reported in the output.

1. Finally, hit again [http://localhost:9001](http://localhost:9001) and see that response is actually the original one.

## Shutting down

1. Run `docker-compose -p myapp down` and `docker-compose -p myapp_test down`

## How it works

First of all, we have our regular `docker-compose.yml` file. However, if you read it carefully, you'll notice an important section is missing: `nginx` service has is `ports` section missing.

That is actually found in the other two files, `docker-compose.stable.yml` and `docker-compose.canary.yml`, that override the default configuration by setting each a different mapping.

However, this is __not__ enough to achieve our goal, since Docker has still no way to distinguish two versions of the same images.

Fortunately, there's another option you can supply to `docker-compose`, the `--project-name` (short `-p`) argument. If you take a look at both scripts, you'll notice that we're using two different values, `myapp` in production, and `myapp_canary` otherwise.

Indeed, this makes Docker deploy two different apps in practice. So, the two commands are simply:

- `docker-compose -p myapp -f docker-compose.yml -f docker-compose.stable.yml up -d --build`
- `docker-compose -p myapp_test -f docker-compose.yml -f docker-compose.canary.yml up -d --build`

## References

- Docker Docs - [Share Compose configurations between files and projects](https://docs.docker.com/compose/extends/)

- Docker Docs - [Using Compose in production](https://docs.docker.com/compose/production/)