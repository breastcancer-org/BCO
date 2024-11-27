# Breast Cancer Organization Chatbot Repo
# Prerequisites 

aws-cli version == 2.15.41

cdk version == 2.170.0

# Initial Instructions

- Fork the Repo
- Go to Settings in Github
- Go to Developer Settings
- Click on Personal Access Tokens
- Choose 'Tokens (classic)'
- Choose generate Token (classic)
- Add a note such as 'BCO_Chatbot'
- Choose the Token Expiration period
- Choose the following options: Repo, repo_hook
- Generate Token and store it

# Setup Instructions

- Clone Repo

```git clone $repo-link```

- Traverse to CDK Folder
```cd BCO/CDK```

- Deploy using the CDK as follows
```
cdk bootstrap -c githubToken=$stored-github-token
cdk synth -c githubToken=$stored-github-token
cdk deploy -c githubToken=$stored-github-token
```

# Post-Deployment Instructions

- Go to the created amplify app in AWS Console
- Choose Start Migration option upon receiving a popup
- Choose Configure Github App and complete Installation
- Choose the app and click Run Job
- After the Deployment is completed, Click the domain Link

# Congratulations!! You've Deployed the BCO Chatbot! 
