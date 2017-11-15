# cfn-doc-json-stubs
CloudFormation documentation to json scraper script

## Usage

### Download html
From the command line, run the following:

```$ node generate.js download```

This will scrape the CLoudFormation html documentation and save them to a new folder named html/.

### Generate the json

If the html has been downloaded, run the following command next:

```$ node generate.js generate-json```

This will generate the json files from the html pages.
