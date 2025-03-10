import type { Kysely } from 'kysely';

import { faker } from '@faker-js/faker';
import { sql } from 'kysely';

import type { DB } from '../schema/schema';

// updated for schema with INT IDs
export async function seed(db: Kysely<DB>): Promise<void> {
    try {
        // Temporarily disable triggers during bulk insert
        await db.executeQuery(sql`SET session_replication_role = 'origin'`.compile(db));

        // Track created IDs for relationships
        const userIds: number[] = [];
        const sitterIds: number[] = [];
        const dogBreedIds: number[] = [];
        const dogIds: number[] = [];

        // Seed dog breeds first (they have no dependencies)
        const breedNames = [
            'Labrador Retriever',
            'German Shepherd',
            'Golden Retriever',
            'French Bulldog',
            'Beagle',
            'Poodle',
            'Rottweiler',
            'Dachshund',
            'Corgi',
            'Australian Shepherd',
            'Shih Tzu',
            'Great Dane',
            'Doberman',
            'Border Collie',
            'Boxer',
        ];

        const sizeCategories: ('tiny' | 'small' | 'medium' | 'large' | 'giant')[] = [
            'tiny',
            'small',
            'medium',
            'large',
            'giant',
        ];

        // Insert dog breeds
        for (const breedName of breedNames) {
            const size = sizeCategories[Math.floor(Math.random() * sizeCategories.length)];
            const specialCare = Math.random() > 0.7
                ? faker.lorem.paragraph(1)
                : null;
            const requiresCertificate = Math.random() > 0.9;

            const [breed] = await db
                .insertInto('dog_breeds')
                .values({
                    name: breedName,
                    size_category: size,
                    special_care_requirements: specialCare,
                    requires_certificate: requiresCertificate,
                })
                .returning('id')
                .execute();

            dogBreedIds.push(breed.id);
        }

        // Create 20 users (both clients and potential sitters)
        for (let i = 0; i < 20; i++) {
            const firstName = faker.person.firstName();
            const lastName = faker.person.lastName();

            const [user] = await db
                .insertInto('users')
                .values({
                    email: faker.internet.email({ firstName, lastName }),
                    name: `${firstName} ${lastName}`,
                    avatar_url: faker.image.avatar(),
                    phone: faker.phone.number(),
                    bio: faker.person.bio(),
                    address: faker.location.streetAddress(),
                    city: faker.location.city(),
                    state: faker.location.state(),
                    postal_code: faker.location.zipCode(),
                    country: faker.location.country(),
                    latitude: Number.parseFloat(faker.location.latitude().toString()),
                    longitude: Number.parseFloat(faker.location.longitude().toString()),
                    is_active: true,
                    is_email_verified: Math.random() > 0.2, // 80% verified
                })
                .returning('id')
                .execute();

            userIds.push(user.id);

            // 50% chance to be a sitter
            if (Math.random() > 0.5) {
                const [sitter] = await db
                    .insertInto('sitters')
                    .values({
                        user_id: user.id,
                        verification_status: Math.random() > 0.3 ? 'approved' : 'pending',
                        bio: faker.lorem.paragraphs(2),
                        years_experience: Math.floor(Math.random() * 10) + 1,
                        hourly_rate: Number.parseFloat((Math.random() * 30 + 10).toFixed(2)),
                        daily_rate: Number.parseFloat((Math.random() * 100 + 30).toFixed(2)),
                        is_available: Math.random() > 0.2,
                        can_host_at_home: Math.random() > 0.5,
                        max_dogs_at_once: Math.floor(Math.random() * 3) + 1,
                        service_radius_km: Number.parseFloat((Math.random() * 30 + 5).toFixed(2)),
                    })
                    .returning('id')
                    .execute();

                sitterIds.push(sitter.id);

                // Create sitter services (2-5 per sitter)
                const serviceTypes = ['dog_walking', 'overnight_stay', 'daycare', 'boarding', 'training', 'grooming', 'vet_visits', 'pet_taxi'];
                const numServices = Math.floor(Math.random() * 4) + 2;
                const shuffledServices = [...serviceTypes].sort(() => 0.5 - Math.random());

                for (let j = 0; j < numServices; j++) {
                    await db
                        .insertInto('sitter_services')
                        .values({
                            sitter_id: sitter.id,
                            service_name: shuffledServices[j] as any, // Cast to any since it's an enum
                            description: faker.lorem.paragraph(),
                            price: Number.parseFloat((Math.random() * 50 + 15).toFixed(2)),
                            is_available: Math.random() > 0.1,
                        })
                        .execute();
                }

                // Create certificates (0-2 per sitter)
                const numCertificates = Math.floor(Math.random() * 3);
                for (let j = 0; j < numCertificates; j++) {
                    await db
                        .insertInto('sitter_certificates')
                        .values({
                            sitter_id: sitter.id,
                            certificate_name: `${faker.company.name()} Dog Training Certification`,
                            issuing_organization: faker.company.name(),
                            issue_date: faker.date.past(),
                            expiration_date: faker.date.future(),
                            verification_status: Math.random() > 0.3 ? 'approved' : 'pending',
                        })
                        .execute();
                }

                // Create availability (3-7 days per sitter)
                const daysOfWeek = [0, 1, 2, 3, 4, 5, 6];
                const availableDays = [...daysOfWeek].sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 5) + 3);

                for (const day of availableDays) {
                    const startHour = Math.floor(Math.random() * 12) + 7; // 7 AM to 7 PM
                    const endHour = startHour + Math.floor(Math.random() * (24 - startHour - 1)) + 1; // At least 1 hour later

                    await db
                        .insertInto('availability')
                        .values({
                            sitter_id: sitter.id,
                            day_of_week: day,
                            start_time: `${startHour.toString().padStart(2, '0')}:00:00`,
                            end_time: `${endHour.toString().padStart(2, '0')}:00:00`,
                        })
                        .execute();
                }

                // Create breed specialties (1-3 per sitter)
                const numSpecialties = Math.floor(Math.random() * 3) + 1;
                const shuffledBreeds = [...dogBreedIds].sort(() => 0.5 - Math.random());

                for (let j = 0; j < numSpecialties && j < shuffledBreeds.length; j++) {
                    await db
                        .insertInto('sitter_breed_specialties')
                        .values({
                            sitter_id: sitter.id,
                            breed_id: shuffledBreeds[j],
                            experience_years: Math.floor(Math.random() * 5) + 1,
                            additional_notes: Math.random() > 0.7 ? faker.lorem.sentence() : null,
                        })
                        .execute();
                }
            }
        }

        // Create dogs (1-3 per user)
        for (const userId of userIds) {
            const numDogs = Math.floor(Math.random() * 3) + 1;

            for (let i = 0; i < numDogs; i++) {
                const breedId = dogBreedIds[Math.floor(Math.random() * dogBreedIds.length)];
                const isMixed = Math.random() > 0.7;

                const [dog] = await db
                    .insertInto('dogs')
                    .values({
                        owner_id: userId,
                        name: faker.animal.dog(),
                        breed_id: isMixed ? null : breedId,
                        mixed_breed: isMixed,
                        age_years: Math.floor(Math.random() * 15) + 1,
                        age_months: Math.floor(Math.random() * 11),
                        weight_kg: Number.parseFloat((Math.random() * 40 + 2).toFixed(2)),
                        sex: Math.random() > 0.5 ? 'male' : 'female',
                        is_neutered: Math.random() > 0.3,
                        special_needs: Math.random() > 0.8 ? faker.lorem.sentence() : null,
                        medical_conditions: Math.random() > 0.9 ? faker.lorem.sentence() : null,
                        vaccination_status: ['fully_vaccinated', 'partially_vaccinated', 'not_vaccinated', 'unknown'][Math.floor(Math.random() * 4)] as any,
                        temperament: faker.lorem.sentence(),
                        photo_url: `https://placedog.net/500/280?id=${Math.floor(Math.random() * 100)}`,
                    })
                    .returning('id')
                    .execute();

                dogIds.push(dog.id);
            }
        }

        // Create bookings (past, current, and future)
        const locationTypes = ['sitter_home', 'client_home', 'park', 'other'];

        // Create 40 random bookings
        for (let i = 0; i < 40; i++) {
            if (sitterIds.length === 0 || dogIds.length === 0) {
                continue;
            }

            const sitterId = sitterIds[Math.floor(Math.random() * sitterIds.length)];

            // Get sitter's user_id
            const [sitterRecord] = await db
                .selectFrom('sitters')
                .select('user_id')
                .where('id', '=', sitterId)
                .execute();

            // Find a dog owned by someone else (not the sitter)
            let dogId: number | null = null;
            let clientId: number | null = null;
            let attempts = 0;

            while (!dogId && attempts < 10) {
                const randomDogId = dogIds[Math.floor(Math.random() * dogIds.length)];

                const [dogRecord] = await db
                    .selectFrom('dogs')
                    .select('owner_id')
                    .where('id', '=', randomDogId)
                    .execute();

                if (dogRecord.owner_id !== sitterRecord.user_id) {
                    dogId = randomDogId;
                    clientId = dogRecord.owner_id;
                }

                attempts++;
            }

            if (!dogId || !clientId) {
                continue;
            }

            // Get a random service
            const [service] = await db
                .selectFrom('sitter_services')
                .select('id')
                .where('sitter_id', '=', sitterId)
                .execute();

            if (!service) {
                continue;
            }

            // Determine booking dates
            const now = new Date();
            const timeDistribution = Math.random();
            let startDate: Date, endDate: Date, status: string;

            if (timeDistribution < 0.3) {
                // Past booking (30%)
                const daysPast = Math.floor(Math.random() * 60) + 1;
                startDate = new Date(now.getTime() - (daysPast * 24 * 60 * 60 * 1000));
                endDate = new Date(startDate.getTime() + ((Math.floor(Math.random() * 3) + 1) * 24 * 60 * 60 * 1000));
                status = Math.random() > 0.1 ? 'completed' : 'cancelled';
            } else if (timeDistribution < 0.4) {
                // Current booking (10%)
                startDate = new Date(now.getTime() - ((Math.floor(Math.random() * 2) + 1) * 24 * 60 * 60 * 1000));
                endDate = new Date(now.getTime() + ((Math.floor(Math.random() * 2) + 1) * 24 * 60 * 60 * 1000));
                status = 'in_progress';
            } else {
                // Future booking (60%)
                const daysAhead = Math.floor(Math.random() * 60) + 1;
                startDate = new Date(now.getTime() + (daysAhead * 24 * 60 * 60 * 1000));
                endDate = new Date(startDate.getTime() + ((Math.floor(Math.random() * 5) + 1) * 24 * 60 * 60 * 1000));

                if (daysAhead < 7) {
                    status = Math.random() > 0.2 ? 'confirmed' : 'pending';
                } else {
                    status = Math.random() > 0.8 ? 'pending' : 'confirmed';
                }

                if (Math.random() > 0.95) {
                    status = 'rejected';
                }
            }

            // Calculate a realistic price
            const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
            const price = Number.parseFloat((Math.random() * 50 * days + 20).toFixed(2));

            const [booking] = await db
                .insertInto('bookings')
                .values({
                    client_id: clientId,
                    sitter_id: sitterId,
                    dog_id: dogId,
                    service_id: service.id,
                    status: status as any,
                    start_date: startDate.toISOString(),
                    end_date: endDate.toISOString(),
                    location_type: locationTypes[Math.floor(Math.random() * locationTypes.length)] as any,
                    location_address: Math.random() > 0.7 ? faker.location.streetAddress() : null,
                    special_instructions: Math.random() > 0.6 ? faker.lorem.paragraph() : null,
                    total_price: price,
                })
                .returning('id')
                .execute();

            // Add reviews for completed bookings
            if (status === 'completed' && Math.random() > 0.3) {
                // Review by client
                await db
                    .insertInto('reviews')
                    .values({
                        booking_id: booking.id,
                        reviewer_id: clientId,
                        reviewee_id: sitterRecord.user_id,
                        rating: Math.floor(Math.random() * 5) + 1, // 1-5 stars
                        comment: Math.random() > 0.2 ? faker.lorem.paragraph() : null,
                    })
                    .execute();

                // Sometimes review by sitter too
                if (Math.random() > 0.6) {
                    await db
                        .insertInto('reviews')
                        .values({
                            booking_id: booking.id,
                            reviewer_id: sitterRecord.user_id,
                            reviewee_id: clientId,
                            rating: Math.floor(Math.random() * 3) + 3, // 3-5 stars (sitters tend to be nice)
                            comment: Math.random() > 0.3 ? faker.lorem.paragraph() : null,
                        })
                        .execute();
                }
            }
        }

        // Create admin user
        const [adminUser] = await db
            .insertInto('users')
            .values({
                email: 'admin@hundesitting.com',
                name: 'System Administrator',
                is_active: true,
                is_email_verified: true,
            })
            .returning('id')
            .execute();

        // Add the admin user to administrators group
        const adminGroup = await db
            .selectFrom('user_groups')
            .select('id')
            .where('name', '=', 'administrators')
            .executeTakeFirstOrThrow();

        await db
            .insertInto('user_group_memberships')
            .values({
                user_id: adminUser.id,
                group_id: adminGroup.id,
            })
            .execute();

        console.log('Seed completed successfully!');
        console.log(`Created ${userIds.length} users`);
        console.log(`Created ${sitterIds.length} sitters`);
        console.log(`Created ${dogIds.length} dogs`);
        console.log(`Created ${dogBreedIds.length} dog breeds`);
    } finally {
    // Re-enable triggers
        await db.executeQuery(sql`SET session_replication_role = 'origin'`.compile(db));
    }
}
