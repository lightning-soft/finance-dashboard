# Introduction
The repository contains the application `source code`, `IaaC` and `gitlab-ci.yaml`. Client is the frontend for `tradrr` written in Angular2

# Infrastructure
Infrastructure code is located `CI_PROJECT_PATH/IaaC/<< environment >>`. Other than this , k8s manifest yamls are also located in the same path.

# CI/CD Pipeline

Pipeline stages are defined in `gitlab-ci.yaml`.

```yaml
stages:
    - infrastructure
    - install
    - build
    - push
    - deployment
```

Each stage can contain single or multiple Jobs that perform tasks. 

## Pipeline variables

Variable can be found at globally or locally in the `gitlab-ci.yaml` under `variables`.

    variables:
    	AWS_ACCESS_KEY_ID: $DEV_AWS_ACCESS_KEY_ID

Other than this, dynamic variables are passed via

`Settings -> CI/CD -> Variables`

Variables can be either `string` or `file`. Protected variables are scoped only into protected branches.

# Run Pipeline

Pipeline can be triggered manually by

`CI/CD -> Pipelines -> Run pipeline` by Selecting the branch you want to run the  pipeline.

Automated deployment logics can be found under `rules`  in the   `gitlab-ci.yaml`

      rules:
        - if: $CI_COMMIT_BRANCH =~ /^ft-.*/ || $CI_COMMIT_BRANCH == "develop" || $CI_COMMIT_BRANCH == "main"
    
    ---

# Application setup
## Install dependencies 
`npm install`
## production build
`ng build --prod`
## local build
`ng build`
## Run the app

    npm start
    ng serve
    npm run start

## Desktop App
The app acts as a frame for the frontend client. You can build as follows. It will create `dest/` directory inside the root of your app inside which you will find your build.
### Windows
`npm run dist:win`
### MacOS
`npm run dist:mac`
### Linux
`npm run dist:linux`

# Application Endpoints

Application has [development](https://tradrr.dev "development") and [production](https://tradrr.app "production") environment exposed via unique domain names.
