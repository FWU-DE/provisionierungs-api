# Offer API

This module handles the connection to the VIDIS Offer API.

## Key aspects covered

- Retrieval of activated offers for a given school
- Lookup of offer IDs for given client IDs

## Terminologies

**Offer**:
An offer describes an app, platform or service that provides an educational service (Education Provider).

**Client**:
A client, apparent in the form of the clientID property of an offer,
describes one technical unit of an offer that is in it-self capable of establishing a connection to an IDM or this app.
One offer could have multiple clients.
A clientId is unique among all offers.

## Sources

[Official FWU BMI documentation](https://fwu-de.github.io/bmi-docs/api/vidis/#tag/EducationProvider/operation/getActivationBySchoolAndOffer)
