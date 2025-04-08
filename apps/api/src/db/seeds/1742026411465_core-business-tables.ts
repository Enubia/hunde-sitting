import type { Insertable, Kysely } from 'kysely';

import type { DB, DogBreeds, ServiceType, Sex, VaccinationStatus, VerificationStatus } from '../schema.js';

import { faker } from '@faker-js/faker';
import { sql } from 'kysely';

import { dogBreeds } from '../dogbreeds.js';

async function cleanup(db: Kysely<DB>): Promise<void> {
    console.log('🧹 Cleaning up database...');

    await sql`truncate table unavailable_dates restart identity cascade`.execute(db);
    await sql`truncate table availability restart identity cascade`.execute(db);
    await sql`truncate table reviews restart identity cascade`.execute(db);
    await sql`truncate table booking_dogs restart identity cascade`.execute(db);
    await sql`truncate table bookings restart identity cascade`.execute(db);
    await sql`truncate table dogs restart identity cascade`.execute(db);
    await sql`truncate table sitter_breed_specialties restart identity cascade`.execute(db);
    await sql`truncate table dog_breeds restart identity cascade`.execute(db);
    await sql`truncate table sitter_certificates restart identity cascade`.execute(db);
    await sql`truncate table sitter_service_names restart identity cascade`.execute(db);
    await sql`truncate table sitter_services restart identity cascade`.execute(db);
    await sql`truncate table sitters restart identity cascade`.execute(db);
    await sql`truncate table user_groups restart identity cascade`.execute(db);
    await sql`truncate table oauth_accounts restart identity cascade`.execute(db);
    await sql`truncate table email_verification_tokens restart identity cascade`.execute(db);
    await sql`truncate table registration_data restart identity cascade`.execute(db);
    await sql`truncate table users restart identity cascade`.execute(db);

    console.log('✨ Database cleaned up!');
}

async function seedAdminUser(db: Kysely<DB>): Promise<number> {
    const [admin] = await db
        .insertInto('users')
        .values({
            email: 'admin@example.com',
            name: 'Admin User',
            is_active: true,
        })
        .returning('id')
        .execute();

    await db
        .insertInto('registration_data')
        .values({
            user_id: admin.id,
            phone: '+43123456789',
            address: 'Admin Street 1',
            city: 'Vienna',
            state: 'Vienna',
            postal_code: '1010',
            country: 'Austria',
        })
        .execute();

    await db
        .insertInto('user_groups')
        .values({
            user_id: admin.id,
            type: 'admin',
        })
        .execute();

    return admin.id;
}

async function seedReviewerUser(db: Kysely<DB>): Promise<number> {
    const [reviewer] = await db
        .insertInto('users')
        .values({
            email: 'reviewer@example.com',
            name: 'Reviewer User',
            is_active: true,
        })
        .returning('id')
        .execute();

    await db
        .insertInto('registration_data')
        .values({
            user_id: reviewer.id,
            phone: '+43123456788',
            address: 'Reviewer Street 1',
            city: 'Vienna',
            state: 'Vienna',
            postal_code: '1010',
            country: 'Austria',
        })
        .execute();

    await db
        .insertInto('user_groups')
        .values({
            user_id: reviewer.id,
            type: 'reviewer',
        })
        .execute();

    return reviewer.id;
}

async function seedDogBreeds(db: Kysely<DB>): Promise<number[]> {
    const breeds = dogBreeds as Insertable<DogBreeds>[];

    const results = [];
    for (const entry of breeds) {
        const [result] = await db
            .insertInto('dog_breeds')
            .values({
                breed: entry.breed,
                size_category: entry.size_category,
                avg_weight_kg: entry.avg_weight_kg,
                requires_certificate: entry.requires_certificate || false,
            })
            .returning('id')
            .execute();

        results.push(result.id);
    }

    return results;
}

async function seedUsers(db: Kysely<DB>, count: number): Promise<number[]> {
    const userIds: number[] = [];

    for (let i = 0; i < count; i++) {
        const firstName = faker.person.firstName();
        const lastName = faker.person.lastName();
        const name = `${firstName} ${lastName}`;
        const email = faker.internet.email({ firstName, lastName }).toLowerCase();

        const [user] = await db
            .insertInto('users')
            .values({
                email,
                name,
                is_active: true,
            })
            .returning('id')
            .execute();

        userIds.push(user.id);

        await db
            .insertInto('registration_data')
            .values({
                user_id: user.id,
                avatar_url: faker.image.avatar(),
                phone: faker.phone.number({ style: 'international' }),
                bio: faker.lorem.paragraph(),
                address: faker.location.streetAddress(),
                city: faker.location.city(),
                state: faker.location.state(),
                postal_code: faker.location.zipCode(),
                country: faker.location.country(),
                longitude: faker.location.longitude(),
                latitude: faker.location.latitude(),
            })
            .execute();

        // Randomly add oauth account
        if (faker.datatype.boolean(0.3)) {
            const provider = faker.helpers.arrayElement(['google', 'facebook', 'apple']);
            await db
                .insertInto('oauth_accounts')
                .values({
                    user_id: user.id,
                    provider,
                })
                .execute();
        }
    }

    return userIds;
}

async function seedSitters(db: Kysely<DB>, userIds: number[]): Promise<number[]> {
    const sitterIds: number[] = [];
    const verificationStatuses: VerificationStatus[] = ['pending', 'approved', 'rejected'];
    const statusWeights = [0.2, 0.75, 0.05]; // 20% pending, 75% approved, 5% rejected

    for (const userId of userIds) {
        const verificationStatus = weightedRandom(verificationStatuses, statusWeights);
        const is_available = verificationStatus === 'approved' && faker.datatype.boolean(0.9);

        const [sitter] = await db
            .insertInto('sitters')
            .values({
                user_id: userId,
                verification_status: verificationStatus,
                bio: faker.lorem.paragraphs(2),
                years_experience: faker.number.int({ min: 0, max: 15 }),
                hourly_rate: Number.parseFloat(faker.commerce.price({ min: 10, max: 50, dec: 2 })),
                daily_rate: Number.parseFloat(faker.commerce.price({ min: 50, max: 200, dec: 2 })),
                is_available,
                can_host_at_home: faker.datatype.boolean(0.6),
                max_dogs_at_once: faker.number.int({ min: 1, max: 5 }),
                service_radius_km: faker.number.float({ min: 5, max: 50 }),
            })
            .returning('id')
            .execute();

        sitterIds.push(sitter.id);
    }

    return sitterIds;
}

async function seedSitterServices(db: Kysely<DB>, sitterIds: number[]): Promise<void> {
    const serviceTypes: ServiceType[] = [
        'dog_walking',
        'overnight_stay',
        'daycare',
        'boarding',
        'training',
        'grooming',
        'vet_visits',
        'pet_taxi',
    ];

    for (const sitterId of sitterIds) {
    // Each sitter gets 1-5 services
        const numServices = faker.number.int({ min: 1, max: serviceTypes.length });
        const selectedServices = faker.helpers.arrayElements(serviceTypes, numServices);

        for (const service of selectedServices) {
            // Add service name
            await db
                .insertInto('sitter_service_names')
                .values({
                    sitter_id: sitterId,
                    name: service,
                })
                .execute();

            // Add service details
            await db
                .insertInto('sitter_services')
                .values({
                    sitter_id: sitterId,
                    description: faker.lorem.paragraph(),
                    price: Number.parseFloat(faker.commerce.price({ min: 20, max: 150, dec: 2 })),
                })
                .returning('id')
                .execute();
        }
    }
}

async function seedSitterBreedSpecialties(
    db: Kysely<DB>,
    sitterIds: number[],
    breedIds: number[],
): Promise<void> {
    for (const sitterId of sitterIds) {
    // Each sitter specializes in 0-5 breeds
        const numSpecialties = faker.number.int({ min: 0, max: 5 });

        if (numSpecialties > 0) {
            const selectedBreedIds = faker.helpers.arrayElements(breedIds, numSpecialties);

            for (const breedId of selectedBreedIds) {
                await db
                    .insertInto('sitter_breed_specialties')
                    .values({
                        sitter_id: sitterId,
                        breed_id: breedId,
                        experience_years: faker.number.int({ min: 1, max: 10 }),
                        additional_notes: faker.datatype.boolean(0.5) ? faker.lorem.sentence() : null,
                    })
                    .execute();
            }
        }
    }
}

async function seedSitterCertificates(
    db: Kysely<DB>,
    sitterIds: number[],
    certRange: { min: number; max: number },
): Promise<void> {
    const certificationTypes = [
        { name: 'Professional Dog Training', org: 'National Dog Trainers Federation' },
        { name: 'Canine First Aid', org: 'Pet Health Academy' },
        { name: 'Animal Behavior College', org: 'ABC Certification' },
        { name: 'Certified Professional Dog Walker', org: 'Dog Walking Association' },
        { name: 'Pet Nutrition Specialist', org: 'Pet Nutrition Alliance' },
        { name: 'Dangerous Breeds Handling', org: 'Safety First Dog Training' },
    ];

    for (const sitterId of sitterIds) {
        const numCertificates = faker.number.int({ min: certRange.min, max: certRange.max });

        if (numCertificates > 0) {
            const certifications = faker.helpers.arrayElements(certificationTypes, numCertificates);

            for (const cert of certifications) {
                const issueDate = faker.date.past({ years: 5 });
                const expirationDate = faker.date.future({ years: 3, refDate: issueDate });

                await db
                    .insertInto('sitter_certificates')
                    .values({
                        sitter_id: sitterId,
                        certificate_name: cert.name,
                        issuing_organization: cert.org,
                        issue_date: issueDate,
                        expiration_date: faker.datatype.boolean(0.7) ? expirationDate : null,
                        certificate_file_url: faker.datatype.boolean(0.8) ? faker.image.url() : null,
                        verification_status: weightedRandom(['pending', 'approved', 'rejected'], [0.3, 0.6, 0.1]),
                        admin_notes: faker.datatype.boolean(0.3) ? faker.lorem.sentence() : null,
                    })
                    .execute();
            }
        }
    }
}

async function seedDogs(
    db: Kysely<DB>,
    ownerIds: number[],
    breedIds: number[],
    dogsPerOwner: { min: number; max: number },
): Promise<Record<number, number[]>> {
    const dogIdsByOwner: Record<number, number[]> = {};
    const sexOptions: Sex[] = ['male', 'female'];
    const vaccinationOptions: VaccinationStatus[] = [
        'fully_vaccinated',
        'partially_vaccinated',
        'not_vaccinated',
        'unknown',
    ];

    for (const ownerId of ownerIds) {
        dogIdsByOwner[ownerId] = [];
        const numDogs = faker.number.int({ min: dogsPerOwner.min, max: dogsPerOwner.max });
        const isMixedBreed = faker.datatype.boolean(0.2);
        // first in the table
        const mixedBreedId = 1;

        for (let i = 0; i < numDogs; i++) {
            const [dog] = await db
                .insertInto('dogs')
                .values({
                    owner_id: ownerId,
                    name: faker.person.firstName(),
                    breed_id: isMixedBreed ? mixedBreedId : faker.helpers.arrayElement(breedIds),
                    age_years: faker.number.int({ min: 0, max: 15 }),
                    age_months: faker.number.int({ min: 0, max: 11 }),
                    weight_kg: faker.number.float({ min: 1, max: 80 }),
                    sex: faker.helpers.arrayElement(sexOptions),
                    is_neutered: faker.datatype.boolean(0.7),
                    medical_conditions: faker.datatype.boolean(0.2) ? faker.lorem.sentences(2) : null,
                    special_care_requirements: faker.datatype.boolean(0.3) ? faker.lorem.paragraph() : null,
                    vaccination_status: faker.helpers.arrayElement(vaccinationOptions),
                    photo_url: faker.datatype.boolean(0.8) ? faker.image.urlLoremFlickr({ category: 'dog' }) : null,
                })
                .returning('id')
                .execute();

            dogIdsByOwner[ownerId].push(dog.id);
        }
    }

    return dogIdsByOwner;
}

async function seedAvailability(db: Kysely<DB>, sitterIds: number[]): Promise<void> {
    for (const sitterId of sitterIds) {
    // Create 3-7 availability slots per week
        const availableDays = faker.helpers.arrayElements([0, 1, 2, 3, 4, 5, 6], faker.number.int({ min: 3, max: 7 }));

        for (const day of availableDays) {
            const availabilitySlots = faker.number.int({ min: 1, max: 2 });

            for (let i = 0; i < availabilitySlots; i++) {
                // Create time slots (morning and/or afternoon)
                let startHour, endHour;

                if (i === 0) {
                    // Morning slot
                    startHour = faker.number.int({ min: 7, max: 11 });
                    endHour = faker.number.int({ min: startHour + 2, max: 14 });
                } else {
                    // Afternoon slot
                    startHour = faker.number.int({ min: 14, max: 17 });
                    endHour = faker.number.int({ min: startHour + 2, max: 21 });
                }

                const startTime = `${startHour.toString().padStart(2, '0')}:00:00`;
                const endTime = `${endHour.toString().padStart(2, '0')}:00:00`;

                await db
                    .insertInto('availability')
                    .values({
                        sitter_id: sitterId,
                        day_of_week: day,
                        start_time: startTime,
                        end_time: endTime,
                    })
                    .execute();
            }
        }
    }
}

async function seedUnavailableDates(db: Kysely<DB>, sitterIds: number[]): Promise<void> {
    for (const sitterId of sitterIds) {
    // Create 0-3 unavailable date ranges
        const unavailableRanges = faker.number.int({ min: 0, max: 3 });

        for (let i = 0; i < unavailableRanges; i++) {
            // Create date range (could be past or future)
            const isPast = faker.datatype.boolean(0.2);

            let startDate, endDate;
            if (isPast) {
                startDate = faker.date.past({ years: 0.5 });
                endDate = new Date(startDate);
                endDate.setDate(startDate.getDate() + faker.number.int({ min: 1, max: 14 }));
            } else {
                startDate = faker.date.future({ years: 0.5 });
                endDate = new Date(startDate);
                endDate.setDate(startDate.getDate() + faker.number.int({ min: 1, max: 14 }));
            }

            const reasons = [
                'Vacation',
                'Personal time off',
                'Family visit',
                'Health reasons',
                'Out of town',
                null,
            ];

            await db
                .insertInto('unavailable_dates')
                .values({
                    sitter_id: sitterId,
                    start_date: startDate,
                    end_date: endDate,
                    reason: faker.helpers.arrayElement(reasons),
                })
                .execute();
        }
    }
}

async function seedBookings(
    db: Kysely<DB>,
    clientIds: number[],
    sitterIds: number[],
    dogIdsByOwner: Record<number, number[]>,
    bookingsPerSitter: { min: number; max: number },
): Promise<number[]> {
    const bookingIds: number[] = [];
    const locationTypes = ['sitter_home', 'client_home', 'park', 'other'];

    for (const sitterId of sitterIds) {
    // Get sitter's service IDs
        const services = await db
            .selectFrom('sitter_services')
            .select(['id'])
            .where('sitter_id', '=', sitterId)
            .execute();

        if (services.length === 0) {
            continue;
        }

        const numBookings = faker.number.int({ min: bookingsPerSitter.min, max: bookingsPerSitter.max });

        for (let i = 0; i < numBookings; i++) {
            // Randomly determine if booking is past, present or future
            const timing = weightedRandom(['past', 'ongoing', 'future'], [0.4, 0.1, 0.5]);

            let startDate, endDate;
            if (timing === 'past') {
                const pastDays = faker.number.int({ min: 10, max: 120 });
                startDate = new Date(Date.now() - (pastDays * 24 * 60 * 60 * 1000));
                endDate = new Date(startDate);
                endDate.setDate(startDate.getDate() + faker.number.int({ min: 1, max: 5 }));
            } else if (timing === 'ongoing') {
                const pastDays = faker.number.int({ min: 0, max: 2 });
                startDate = new Date(Date.now() - (pastDays * 24 * 60 * 60 * 1000));
                endDate = new Date(Date.now() + (faker.number.int({ min: 1, max: 3 }) * 24 * 60 * 60 * 1000));
            } else {
                const futureDays = faker.number.int({ min: 3, max: 60 });
                startDate = new Date(Date.now() + (futureDays * 24 * 60 * 60 * 1000));
                endDate = new Date(startDate);
                endDate.setDate(startDate.getDate() + faker.number.int({ min: 1, max: 7 }));
            }

            // Select random client and service
            const clientId = faker.helpers.arrayElement(clientIds);
            const serviceId = faker.helpers.arrayElement(services).id;

            // Determine status based on timing
            let status: string;
            let canceledBy: number | null = null;

            if (timing === 'past') {
                // Past bookings are either completed or cancelled
                status = faker.datatype.boolean(0.9) ? 'completed' : 'cancelled';
                if (status === 'cancelled') {
                    canceledBy = faker.datatype.boolean() ? clientId : sitterId;
                }
            } else if (timing === 'ongoing') {
                status = 'confirmed';
            } else {
                // Future bookings are either pending, confirmed or cancelled
                status = weightedRandom(['pending', 'confirmed', 'cancelled'], [0.2, 0.7, 0.1]);
                if (status === 'cancelled') {
                    canceledBy = faker.datatype.boolean() ? clientId : sitterId;
                }
            }

            // Calculate price
            const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
            const basePrice = faker.number.float({ min: 20, max: 50 });
            const totalPrice = basePrice * days;

            const [booking] = await db
                .insertInto('bookings')
                .values({
                    client_id: clientId,
                    sitter_id: Number(sitterId), // Convert to number to ensure type safety
                    service_id: serviceId,
                    status: status as any,
                    canceled_by: canceledBy,
                    start_date: startDate,
                    end_date: endDate,
                    location_type: faker.helpers.arrayElement(locationTypes) as any,
                    location_address: faker.datatype.boolean(0.7) ? faker.location.streetAddress(true) : null,
                    special_instructions: faker.datatype.boolean(0.6) ? faker.lorem.paragraph() : null,
                    total_price: totalPrice,
                })
                .returning('id')
                .execute();

            bookingIds.push(booking.id);

            // Add dogs to booking
            const ownerDogs = dogIdsByOwner[clientId] || [];
            if (ownerDogs.length > 0) {
                const numDogs = Math.min(faker.number.int({ min: 1, max: 3 }), ownerDogs.length);
                const selectedDogs = faker.helpers.arrayElements(ownerDogs, numDogs);

                for (const dogId of selectedDogs) {
                    await db
                        .insertInto('booking_dogs')
                        .values({
                            booking_id: booking.id,
                            dog_id: dogId,
                        })
                        .execute();
                }
            }
        }
    }

    return bookingIds;
}

async function seedReviews(
    db: Kysely<DB>,
    clientIds: number[],
    sitterUserIds: number[],
    reviewsPerSitter: { min: number; max: number },
): Promise<void> {
    for (const sitterUserId of sitterUserIds) {
        const numReviews = faker.number.int({ min: reviewsPerSitter.min, max: reviewsPerSitter.max });

        // Get potential reviewers (excluding this sitter)
        const potentialReviewers = clientIds.filter(id => id !== sitterUserId);

        for (let i = 0; i < numReviews; i++) {
            const reviewerId = faker.helpers.arrayElement(potentialReviewers);
            const rating = weightedRandom([1, 2, 3, 4, 5], [0.05, 0.1, 0.15, 0.3, 0.4]);
            const reviewDate = faker.date.past({ years: 1 });

            await db
                .insertInto('reviews')
                .values({
                    reviewer_id: reviewerId,
                    sitter_id: sitterUserId,
                    rating,
                    comment: faker.lorem.paragraph(),
                    created_at: reviewDate,
                    updated_at: reviewDate,
                })
                .execute();
        }
    }
}

function weightedRandom<T>(items: T[], weights: number[]): T {
    if (items.length !== weights.length) {
        throw new Error('Items and weights must be the same length');
    }

    const cumulativeWeights: number[] = [];
    let sum = 0;

    for (const weight of weights) {
        sum += weight;
        cumulativeWeights.push(sum);
    }

    const random = Math.random() * sum;

    for (let i = 0; i < cumulativeWeights.length; i++) {
        if (random < cumulativeWeights[i]) {
            return items[i];
        }
    }

    return items[items.length - 1];
}

export async function seed(db: Kysely<DB>): Promise<void> {
    try {
        const userCount = 100;
        const sitterPercentage = 0.4;
        const dogsPerOwner = { min: 1, max: 3 };
        const certificatesPerSitter = { min: 0, max: 3 };
        const reviewsPerSitter = { min: 0, max: 10 };
        const bookingsPerSitter = { min: 0, max: 5 };

        await cleanup(db);

        console.log('🌱 Seeding database with dummy data...');

        // Seed admin users
        await seedAdminUser(db);
        await seedReviewerUser(db);

        // Seed dog breeds
        const dogBreeds = await seedDogBreeds(db);

        // Seed regular users
        const userIds = await seedUsers(db, userCount);

        // Determine which users will be sitters
        const sitterCount = Math.floor(userCount * sitterPercentage);
        const potentialSitterIds = [...userIds];
        faker.helpers.shuffle(potentialSitterIds);
        const sitterUserIds = potentialSitterIds.slice(0, sitterCount);
        const clientUserIds = userIds.filter(id => !sitterUserIds.includes(id));

        // Seed sitters
        const sitterIds = await seedSitters(db, sitterUserIds);

        // Seed sitter services and specialties
        await seedSitterServices(db, sitterIds);
        await seedSitterBreedSpecialties(db, sitterIds, dogBreeds);
        await seedSitterCertificates(db, sitterIds, certificatesPerSitter);

        // Seed client dogs
        const dogIdsByOwner = await seedDogs(db, clientUserIds, dogBreeds, dogsPerOwner);

        // Seed availability
        await seedAvailability(db, sitterIds);
        await seedUnavailableDates(db, sitterIds);

        // Seed bookings
        await seedBookings(db, clientUserIds, sitterIds, dogIdsByOwner, bookingsPerSitter);

        // Seed reviews
        await seedReviews(db, clientUserIds, sitterUserIds, reviewsPerSitter);

        console.log('✅ Seeding complete!');
    } catch (error) {
        console.error('Error seeding database:', error);
    }
}
