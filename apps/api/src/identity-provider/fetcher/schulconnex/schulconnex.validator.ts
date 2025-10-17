import z from 'zod';

export const schulconnexUsersResponseSchema = z.array(
  z.object({
    pid: z.string(),
    person: z
      .object({
        stammorganisation: z
          .object({
            id: z.string(),
            kennung: z.string().nullable().optional(),
            name: z.string().nullable().optional(),
            typ: z
              .enum(['SCHULE', 'ANBIETER', 'SONSTIGE'])
              .nullable()
              .optional(),
          })
          .nullable()
          .optional(),
        name: z
          .object({
            vorname: z.string(),
            familienname: z.string(),
          })
          .nullable()
          .optional(),
        geburt: z
          .object({
            datum: z.string().nullable().optional(),
            volljaehrig: z.boolean().nullable().optional(),
            geburtsort: z.string().nullable().optional(),
          })
          .nullable()
          .optional(),
        geschlecht: z.enum(['m', 'w', 'd', 'x']).nullable().optional(),
        lokalisierung: z.string().nullable().optional(),
        vertrauensstufe: z
          .enum(['Kein', 'Unbe', 'Teil', 'Voll'])
          .nullable()
          .optional(),
      })
      .nullable()
      .optional(),
    personenkontexte: z
      .array(
        z.object({
          id: z.string().optional(),
          organisation: z
            .object({
              id: z.string(),
              kennung: z.string().nullable().optional(),
              name: z.string().nullable().optional(),
              anschrift: z
                .object({
                  postleitzahl: z.string().nullable().optional(),
                  ort: z.string().nullable().optional(),
                  ortsteil: z.string().nullable().optional(),
                })
                .nullable()
                .optional(),
              typ: z
                .enum(['SCHULE', 'ANBIETER', 'SONSTIGE'])
                .nullable()
                .optional(),
            })
            .nullable()
            .optional(),
          rolle: z
            .enum([
              'LERN',
              'LEHR',
              'SORGBER',
              'EXTERN',
              'ORGADMIN',
              'LEIT',
              'SYSADMIN',
            ])
            .nullable()
            .optional(),
          erreichbarkeiten: z
            .array(
              z.object({
                typ: z.enum(['E-Mail']),
                kennung: z.string().nullable().optional(),
              }),
            )
            .nullable()
            .optional(),
          personenstatus: z.literal('Aktiv').nullable().optional(),
          gruppen: z
            .array(
              z.object({
                gruppe: z
                  .object({
                    id: z.string(),
                    orgid: z.string().nullable().optional(),
                    bezeichnung: z.string().nullable().optional(),
                    thema: z.string().nullable().optional(),
                    beschreibung: z.string().nullable().optional(),
                    typ: z.string().nullable().optional(),
                    bereich: z
                      .enum([
                        'Pflicht',
                        'Wahl',
                        'Wahlpflicht',
                        'Grundkurs',
                        'Leistungskurs',
                      ])
                      .nullable()
                      .optional(),
                    optionen: z.array(z.string()).nullable().optional(),
                    differenzierung: z.string().nullable().optional(),
                    bildungsziele: z.array(z.string()).nullable().optional(),
                    jahrgangsstufen: z.array(z.string()).nullable().optional(),
                    faecher: z.array(z.string()).nullable().optional(),
                    laufzeit: z
                      .object({
                        von: z.iso.datetime().nullable().optional(),
                        vonlernperiode: z.string().nullable().optional(),
                        bis: z.iso.datetime().nullable().optional(),
                        bislernperiode: z.string().nullable().optional(),
                      })
                      .nullable()
                      .optional(),
                  })
                  .nullable()
                  .optional(),
                gruppenzugehoerigkeit: z
                  .object({
                    ktid: z.string().nullable().optional(),
                    rollen: z
                      .array(
                        z.enum([
                          'Lern',
                          'Lehr',
                          'KlLeit',
                          'Foerd',
                          'VLehr',
                          'SchB',
                          'GMit',
                          'GLeit',
                        ]),
                      )
                      .nullable()
                      .optional(),
                    von: z.iso.datetime().nullable().optional(),
                    bis: z.iso.datetime().nullable().optional(),
                  })
                  .nullable()
                  .optional(),
                sonstige_gruppenzugehoerige: z
                  .array(
                    z.object({
                      ktid: z.string().nullable().optional(),
                      rollen: z
                        .array(
                          z.enum([
                            'Lern',
                            'Lehr',
                            'KlLeit',
                            'Foerd',
                            'VLehr',
                            'SchB',
                            'GMit',
                            'GLeit',
                          ]),
                        )
                        .nullable()
                        .optional(),
                      von: z.iso.datetime().nullable().optional(),
                      bis: z.iso.datetime().nullable().optional(),
                    }),
                  )
                  .nullable()
                  .optional(),
              }),
            )
            .nullable()
            .optional(),
          beziehungen: z
            .object({
              hat_als: z.array(
                z.object({
                  ktid: z.string().nullable().optional(),
                  beziehung: z.enum(['SorgBer', 'SchB']).nullable().optional(),
                }),
              ),
              ist_von: z.array(
                z.object({
                  ktid: z.string().nullable().optional(),
                  beziehung: z.enum(['SorgBer', 'SchB']).nullable().optional(),
                }),
              ),
            })
            .nullable()
            .optional(),
          loeschung: z
            .object({
              zeitpunkt: z.iso.datetime().nullable().optional(),
            })
            .nullable()
            .optional(),
        }),
      )
      .nullable()
      .optional(),
  }),
);
