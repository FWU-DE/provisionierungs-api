import z from 'zod';

export const schulconnexUsersResponseSchema = z.array(
  z.object({
    pid: z.string(),
    person: z
      .object({
        stammorganisation: z.object({
          id: z.string(),
          kennung: z.string().nullable().optional(),
          name: z.string().nullable().optional(),
        }),
        name: z
          .object({
            vorname: z.string(),
            familienname: z.string(),
          })
          .nullable(),
        geburt: z
          .object({
            datum: z.string(),
            volljaehrig: z.boolean(),
            geburtsort: z.string(),
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
      .optional(),
    personenkontexte: z
      .array(
        z
          .object({
            id: z.string().optional(),
            organisation: z
              .object({
                id: z.string(),
                kennung: z.string().nullable(),
                name: z.string(),
                anschrift: z
                  .object({
                    postleitzahl: z.string(),
                    ort: z.string(),
                  })
                  .nullable(),
                typ: z.enum(['SCHULE', 'ANBIETER', 'SONSTIGE']),
              })
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
              .optional(),
            erreichbarkeiten: z
              .array(
                z
                  .object({
                    typ: z.enum(['E-Mail']),
                    kennung: z.string(),
                  })
                  .optional(),
              )
              .optional(),
            personenstatus: z.literal('Aktiv').nullable().optional(),
            gruppen: z
              .array(
                z
                  .object({
                    gruppe: z.object({
                      id: z.string(),
                      orgid: z.string().optional(),
                      bezeichnung: z.string().optional(),
                      thema: z.string().optional(),
                      beschreibung: z.string().optional(),
                      typ: z.string().optional(),
                      bereich: z
                        .enum([
                          'Pflicht',
                          'Wahl',
                          'Wahlpflicht',
                          'Grundkurs',
                          'Leistungskurs',
                        ])
                        .optional(),
                      optionen: z.array(z.string()).optional(),
                      differenzierung: z.string().optional(),
                      bildungsziele: z.array(z.string()).optional(),
                      jahrgangsstufen: z.array(z.string()).optional(),
                      faecher: z.array(z.string()).optional(),
                      laufzeit: z
                        .object({
                          von: z.iso.datetime().optional(), // @todo: Check if this actually works
                          vonlernperiode: z.string().optional(),
                          bis: z.iso.datetime().optional(), // @todo: Check if this actually works
                          bislernperiode: z.string().optional(),
                        })
                        .optional(),
                    }),
                  })
                  .optional(),
              )
              .optional(),
            beziehungen: z
              .object({
                hat_als: z.array(
                  z.object({
                    ktid: z.string(),
                    beziehung: z.enum(['SorgBer', 'SchB']),
                  }),
                ),
                ist_von: z.array(
                  z.object({
                    ktid: z.string(),
                    beziehung: z.enum(['SorgBer', 'SchB']),
                  }),
                ),
              })
              .nullable()
              .optional(),
            loeschung: z
              .object({
                zeitpunkt: z.iso.datetime().optional(), // @todo: Check if this actually works
              })
              .nullable(),
          })
          .optional(),
      )
      .optional(),
  }),
);
