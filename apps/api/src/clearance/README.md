# Clearance process

...

## tmp notes (to be converted into proper documentation)

- Data might get pre-filtered by IDMs on the basis of out AVV (Auftragsverarbeitungsvertrag) with them.
- Two layers of filtration, both set via UI and stored inside the DB
  - Clearance by allowed (schulconnex) groups for a given offer
  - Clearance of data fields for a given offer
- Clearance Flow
  - UI
    - Administrative school user logs in with his VIDIS credentials.
    - The user's JWT includes information his related IDM and schools.
    - All groups of these schools get fetched
    - All offers that are activated for the given school get fetched
    - Groups and Offers get shown to the user for him to configure their clearance relations.
    - The user could also configure a set of schulconnex data properties to show/hide.
    - The clearance entries get stored in a database.
  - API
    - An offer's client requests data from the API and provides a clientId.
    - A look-up for the related (to the clientId) offerID happens.
    - All clearance entries fitting the offerId get fetched.
    - All IDMs included in the given clearance entries get queried for the requested data.
    - A clearance filtration process makes sure that
      - only entries are included, that are related to a group from the clearance entries
      - only data properties are included, that have clearance
- ...
