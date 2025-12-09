# Saarland (@todo: Set actual IDM name here)

This adapter represents the Saarland IDM.

@todo: Cleanup -> Remove the following notes...

## Notes on the implementation:

- Use "/organisationen-info" to fetch all available oragnizations for a client.
- Use "organisation.id" as a filter with "/personen-info" to fetch all available data.
- Accumulate all results into one response.
