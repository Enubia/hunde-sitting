function poundsToKg(pounds: string | number) {
    if (typeof pounds === 'number') {
        return pounds * 0.453592;
    }

    if (pounds === 'NA') {
        return 0;
    }

    if (pounds.includes('<')) {
        const max = Number.parseFloat(pounds.slice(1));
        return max * 0.453592;
    }

    if (pounds.includes('>')) {
        const min = Number.parseFloat(pounds.slice(1));
        return min * 0.453592;
    }

    const [min, max] = pounds.split('-').map(Number.parseFloat);
    const avg = (min + max) / 2;
    return avg * 0.453592;
}

export const dogBreeds = [
    {
        breed: 'Mixed Breed',
        avg_weight_kg: 0,
        size_category: 'NA',
    },
    {
        breed: 'Affenpinscher',
        avg_weight_kg: poundsToKg('7-10'),
        size_category: 'tiny',
    },
    {
        breed: 'Biewer Terrier',
        avg_weight_kg: poundsToKg('4-8'),
        size_category: 'tiny',
    },
    {
        breed: 'Bolognese',
        avg_weight_kg: poundsToKg('5.5-9'),
        size_category: 'tiny',
    },
    {
        breed: 'Brussels Griffon',
        avg_weight_kg: poundsToKg('8-10'),
        size_category: 'tiny',
    },
    {
        breed: 'Chihuahua',
        avg_weight_kg: poundsToKg('<6'),
        size_category: 'tiny',
    },
    {
        breed: 'Chinese Crested',
        avg_weight_kg: poundsToKg('8-12'),
        size_category: 'tiny',
    },
    {
        breed: 'Japanese Chin',
        avg_weight_kg: poundsToKg('7-11'),
        size_category: 'tiny',
    },
    {
        breed: 'Maltese',
        avg_weight_kg: poundsToKg('<7'),
        size_category: 'tiny',
    },
    {
        breed: 'Toy Manchester Terrier',
        avg_weight_kg: poundsToKg('<12'),
        size_category: 'tiny',
    },
    {
        breed: 'Miniature Pinscher',
        avg_weight_kg: poundsToKg('8-10'),
        size_category: 'tiny',
    },
    {
        breed: 'Papillon',
        avg_weight_kg: poundsToKg('5-10'),
        size_category: 'tiny',
    },
    {
        breed: 'Pomeranian',
        avg_weight_kg: poundsToKg('3-7'),
        size_category: 'tiny',
    },
    {
        breed: 'Toy Poodle',
        avg_weight_kg: poundsToKg('4-6'),
        size_category: 'tiny',
    },
    {
        breed: 'Russian Toy',
        avg_weight_kg: poundsToKg('<6.5'),
        size_category: 'tiny',
    },
    {
        breed: 'Russian Tsvetnaya Bolonka',
        avg_weight_kg: poundsToKg('4.5-11'),
        size_category: 'tiny',
    },
    {
        breed: 'Silky Terrier',
        avg_weight_kg: poundsToKg(10),
        size_category: 'tiny',
    },
    {
        breed: 'Toy Fox Terrier',
        avg_weight_kg: poundsToKg('NA'),
        size_category: 'tiny',
    },
    {
        breed: 'Yorkshire Terrier',
        avg_weight_kg: poundsToKg(7),
        size_category: 'tiny',
    },
    {
        breed: 'American Eskimo Dog',
        avg_weight_kg: poundsToKg('10-20'),
        size_category: 'small',
    },
    {
        breed: 'American Hairless Terrier',
        avg_weight_kg: poundsToKg('12-16'),
        size_category: 'small',
    },
    {
        breed: 'Australian Terrier',
        avg_weight_kg: poundsToKg('15-20'),
        size_category: 'small',
    },
    {
        breed: 'Basenji',
        avg_weight_kg: poundsToKg('22-24'),
        size_category: 'small',
    },
    {
        breed: 'Beagle',
        avg_weight_kg: poundsToKg('20-30'),
        size_category: 'small',
    },
    {
        breed: 'Bedlington Terrier',
        avg_weight_kg: poundsToKg('17-23'),
        size_category: 'small',
    },
    {
        breed: 'Bichon Frise',
        avg_weight_kg: poundsToKg('12-18'),
        size_category: 'small',
    },
    {
        breed: 'Border Terrier',
        avg_weight_kg: poundsToKg('11.5-15.5'),
        size_category: 'small',
    },
    {
        breed: 'Boston Terrier',
        avg_weight_kg: poundsToKg('12-25'),
        size_category: 'small',
    },
    {
        breed: 'Cairn Terrier',
        avg_weight_kg: poundsToKg('13-14'),
        size_category: 'small',
    },
    {
        breed: 'Cardigan Welsh Corgi',
        avg_weight_kg: poundsToKg('25-38'),
        size_category: 'small',
    },
    {
        breed: 'Cavalier King Charles Spaniel',
        avg_weight_kg: poundsToKg('13-18'),
        size_category: 'small',
    },
    {
        breed: 'Cesky Terrier',
        avg_weight_kg: poundsToKg('14-24'),
        size_category: 'small',
    },
    {
        breed: 'Cocker Spaniel',
        avg_weight_kg: poundsToKg('20-30'),
        size_category: 'small',
    },
    {
        breed: 'Coton de Tulear',
        avg_weight_kg: poundsToKg('8-15'),
        size_category: 'small',
    },
    {
        breed: 'Dachshund',
        avg_weight_kg: poundsToKg('11-32'),
        size_category: 'small',
    },
    {
        breed: 'Dandie Dinmont Terrier',
        avg_weight_kg: poundsToKg('18-24'),
        size_category: 'small',
    },
    {
        breed: 'Danish-Swedish Farmdog',
        avg_weight_kg: poundsToKg('15-20'),
        size_category: 'small',
    },
    {
        breed: 'English Toy Spaniel',
        avg_weight_kg: poundsToKg('8-14'),
        size_category: 'small',
    },
    {
        breed: 'French Bulldog',
        avg_weight_kg: poundsToKg('<28'),
        size_category: 'small',
    },
    {
        breed: 'German Spitz',
        avg_weight_kg: poundsToKg('24-26'),
        size_category: 'small',
    },
    {
        breed: 'Glen of Imaal Terrier',
        avg_weight_kg: poundsToKg('32-40'),
        size_category: 'small',
    },
    {
        breed: 'Havanese',
        avg_weight_kg: poundsToKg('7-13'),
        size_category: 'small',
    },
    {
        breed: 'Italian Greyhound',
        avg_weight_kg: poundsToKg('7-14'),
        size_category: 'small',
    },
    {
        breed: 'Jagdterrier',
        avg_weight_kg: poundsToKg('17-22'),
        size_category: 'small',
    },
    {
        breed: 'Japanese Terrier',
        avg_weight_kg: poundsToKg('18-28'),
        size_category: 'small',
    },
    {
        breed: 'Lakeland Terrier',
        avg_weight_kg: poundsToKg(17),
        size_category: 'small',
    },
    {
        breed: 'Lancashire Heeler',
        avg_weight_kg: poundsToKg('9-17'),
        size_category: 'small',
    },
    {
        breed: 'Lhasa Apso',
        avg_weight_kg: poundsToKg('12-18'),
        size_category: 'small',
    },
    {
        breed: 'Lowchen',
        avg_weight_kg: poundsToKg(15),
        size_category: 'small',
    },
    {
        breed: 'Standard Manchester Terrier',
        avg_weight_kg: poundsToKg('12-22'),
        size_category: 'small',
    },
    {
        breed: 'Miniature Bull Terrier',
        avg_weight_kg: poundsToKg('18-28'),
        size_category: 'small',
    },
    {
        breed: 'Miniature Schnauzer',
        avg_weight_kg: poundsToKg('11-20'),
        size_category: 'small',
    },
    {
        breed: 'Norfolk Terrier',
        avg_weight_kg: poundsToKg('11-12'),
        size_category: 'small',
    },
    {
        breed: 'Norrbottenspets',
        avg_weight_kg: poundsToKg('20-30'),
        size_category: 'small',
    },
    {
        breed: 'Norwegian Lundehund',
        avg_weight_kg: poundsToKg('20-30'),
        size_category: 'small',
    },
    {
        breed: 'Norwich Terrier',
        avg_weight_kg: poundsToKg(12),
        size_category: 'small',
    },
    {
        breed: 'Parson Russell Terrier',
        avg_weight_kg: poundsToKg('13-17'),
        size_category: 'small',
    },
    {
        breed: 'Pekingese',
        avg_weight_kg: poundsToKg(14),
        size_category: 'small',
    },
    {
        breed: 'Pembroke Welsh Corgi',
        avg_weight_kg: poundsToKg('28-30'),
        size_category: 'small',
    },
    {
        breed: 'Peruvian Inca Orchid',
        avg_weight_kg: poundsToKg('8.5-17.5'),
        size_category: 'small',
    },
    {
        breed: 'Miniature Poodle',
        avg_weight_kg: poundsToKg('10-15'),
        size_category: 'small',
    },
    {
        breed: 'Potuguese Podengo Pequeno',
        avg_weight_kg: poundsToKg('9-13'),
        size_category: 'small',
    },
    {
        breed: 'Pug',
        avg_weight_kg: poundsToKg('14-18'),
        size_category: 'small',
    },
    {
        breed: 'Pumi',
        avg_weight_kg: poundsToKg('22-29'),
        size_category: 'small',
    },
    {
        breed: 'Rat Terrier',
        avg_weight_kg: poundsToKg('10-25'),
        size_category: 'small',
    },
    {
        breed: 'Russell Terrier',
        avg_weight_kg: poundsToKg('9-15'),
        size_category: 'small',
    },
    {
        breed: 'Schipperke',
        avg_weight_kg: poundsToKg('10-16'),
        size_category: 'small',
    },
    {
        breed: 'Scottish terrier',
        avg_weight_kg: poundsToKg('18-22'),
        size_category: 'small',
    },
    {
        breed: 'Sealyham Terrier',
        avg_weight_kg: poundsToKg('23-24'),
        size_category: 'small',
    },
    {
        breed: 'Shetland Sheepdog',
        avg_weight_kg: poundsToKg('15-25'),
        size_category: 'small',
    },
    {
        breed: 'Shiba Inu',
        avg_weight_kg: poundsToKg('17-23'),
        size_category: 'small',
    },
    {
        breed: 'Shih Tzu',
        avg_weight_kg: poundsToKg('9-16'),
        size_category: 'small',
    },
    {
        breed: 'Smooth Fox Terrier',
        avg_weight_kg: poundsToKg('15-18'),
        size_category: 'small',
    },
    {
        breed: 'Swedish Vallhund',
        avg_weight_kg: poundsToKg('20-35'),
        size_category: 'small',
    },
    {
        breed: 'Teddy Roosevelt Terrier',
        avg_weight_kg: poundsToKg('8-25'),
        size_category: 'small',
    },
    {
        breed: 'Tibetan Spaniel',
        avg_weight_kg: poundsToKg('9-15'),
        size_category: 'small',
    },
    {
        breed: 'Tibetan Terrier',
        avg_weight_kg: poundsToKg('18-30'),
        size_category: 'small',
    },
    {
        breed: 'Welsh Terrier',
        avg_weight_kg: poundsToKg(20),
        size_category: 'small',
    },
    {
        breed: 'West Highland White Terrier',
        avg_weight_kg: poundsToKg('15-20'),
        size_category: 'small',
    },
    {
        breed: 'Wire Fox Terrier',
        avg_weight_kg: poundsToKg('15-18'),
        size_category: 'small',
    },
    {
        breed: 'Airedale Terrier',
        avg_weight_kg: poundsToKg('50-70'),
        size_category: 'medium',
    },
    {
        breed: 'Alaska Klee Kai',
        avg_weight_kg: poundsToKg('16-25'),
        size_category: 'medium',
    },
    {
        breed: 'American English Coonhound',
        avg_weight_kg: poundsToKg('45-65'),
        size_category: 'medium',
    },
    {
        breed: 'American Foxhound',
        avg_weight_kg: poundsToKg('60-70'),
        size_category: 'medium',
    },
    {
        breed: 'American Leopard Hound',
        avg_weight_kg: poundsToKg('45-70'),
        size_category: 'medium',
    },
    {
        breed: 'American Staffordshire Terrier',
        avg_weight_kg: poundsToKg('40-70'),
        size_category: 'medium',
    },
    {
        breed: 'American Water Spaniel',
        avg_weight_kg: poundsToKg('25-45'),
        size_category: 'medium',
    },
    {
        breed: 'Appenzeller Sennenhund',
        avg_weight_kg: poundsToKg('48-70'),
        size_category: 'medium',
    },
    {
        breed: 'Australian Cattle Dog',
        avg_weight_kg: poundsToKg('NA'),
        size_category: 'medium',
    },
    {
        breed: 'Australian Kelpie',
        avg_weight_kg: poundsToKg('NA'),
        size_category: 'medium',
    },
    {
        breed: 'Australian Shepherd',
        avg_weight_kg: poundsToKg('40-65'),
        size_category: 'medium',
    },
    {
        breed: 'Australian Stumpy Tail Cattle Dog',
        avg_weight_kg: poundsToKg('32-45'),
        size_category: 'medium',
    },
    {
        breed: 'Barbado da Terceira',
        avg_weight_kg: poundsToKg('46-60'),
        size_category: 'medium',
    },
    {
        breed: 'Barbet',
        avg_weight_kg: poundsToKg('35-65'),
        size_category: 'medium',
    },
    {
        breed: 'Basset Fauve de Bretagne',
        avg_weight_kg: poundsToKg('27-35'),
        size_category: 'medium',
    },
    {
        breed: 'Basset Hound',
        avg_weight_kg: poundsToKg('40-65'),
        size_category: 'medium',
    },
    {
        breed: 'Bavarian Mountain Scent Hound',
        avg_weight_kg: poundsToKg('NA'),
        size_category: 'medium',
    },
    {
        breed: 'Bearded Collie',
        avg_weight_kg: poundsToKg('45-55'),
        size_category: 'medium',
    },
    {
        breed: 'Bergamasca Sheepdog',
        avg_weight_kg: poundsToKg('57-84'),
        size_category: 'medium',
    },
    {
        breed: 'Bluetick Coonhound',
        avg_weight_kg: poundsToKg('45-80'),
        size_category: 'medium',
    },
    {
        breed: 'Bohemian Shepherd',
        avg_weight_kg: poundsToKg('37-60'),
        size_category: 'medium',
    },
    {
        breed: 'Border Collie',
        avg_weight_kg: poundsToKg('30-55'),
        size_category: 'medium',
    },
    {
        breed: 'Boykin Spaniel',
        avg_weight_kg: poundsToKg('25-40'),
        size_category: 'medium',
    },
    {
        breed: 'Braque du Bourbonnais',
        avg_weight_kg: poundsToKg('35-53'),
        size_category: 'medium',
    },
    {
        breed: 'Braque Francais Pyrenean',
        avg_weight_kg: poundsToKg('40-55'),
        size_category: 'medium',
    },
    {
        breed: 'Brittany',
        avg_weight_kg: poundsToKg('30-40'),
        size_category: 'medium',
    },
    {
        breed: 'Bull Terrier',
        avg_weight_kg: poundsToKg('50-70'),
        size_category: 'medium',
    },
    {
        breed: 'Bulldog',
        avg_weight_kg: poundsToKg('40-50'),
        size_category: 'medium',
    },
    {
        breed: 'Canaan Dog',
        avg_weight_kg: poundsToKg('35-55'),
        size_category: 'medium',
    },
    {
        breed: 'Carolina Dog',
        avg_weight_kg: poundsToKg('30-55'),
        size_category: 'medium',
    },
    {
        breed: 'Chinese Shar-Pei',
        avg_weight_kg: poundsToKg('45-60'),
        size_category: 'medium',
    },
    {
        breed: 'Chow Chow',
        avg_weight_kg: poundsToKg('45-70'),
        size_category: 'medium',
    },
    {
        breed: "Cirneco dell'Etna",
        avg_weight_kg: poundsToKg('17-26'),
        size_category: 'medium',
    },
    {
        breed: 'Clumber Spaniel',
        avg_weight_kg: poundsToKg('NA'),
        size_category: 'medium',
    },
    {
        breed: 'Collie',
        avg_weight_kg: poundsToKg('50-75'),
        size_category: 'medium',
    },
    {
        breed: 'Croatian Sheepdog',
        avg_weight_kg: poundsToKg('29-44'),
        size_category: 'medium',
    },
    {
        breed: 'Czechoslovakian Vlcak',
        avg_weight_kg: poundsToKg('44-57'),
        size_category: 'medium',
    },
    {
        breed: 'Dalmatian',
        avg_weight_kg: poundsToKg('45-70'),
        size_category: 'medium',
    },
    {
        breed: 'Deutscher Wachtelhund',
        avg_weight_kg: poundsToKg('40-55'),
        size_category: 'medium',
    },
    {
        breed: 'Drentsche Patrijshond',
        avg_weight_kg: poundsToKg('48-73'),
        size_category: 'medium',
    },
    {
        breed: 'Drever',
        avg_weight_kg: poundsToKg('35-40'),
        size_category: 'medium',
    },
    {
        breed: 'Dutch Shepherd',
        avg_weight_kg: poundsToKg('42-75'),
        size_category: 'medium',
    },
    {
        breed: 'English Cocker Spaniel',
        avg_weight_kg: poundsToKg('26-34'),
        size_category: 'medium',
    },
    {
        breed: 'English Foxhound',
        avg_weight_kg: poundsToKg('60-75'),
        size_category: 'medium',
    },
    {
        breed: 'English Setter',
        avg_weight_kg: poundsToKg('45-80'),
        size_category: 'medium',
    },
    {
        breed: 'English Springer Spaniel',
        avg_weight_kg: poundsToKg('40-50'),
        size_category: 'medium',
    },
    {
        breed: 'Entlebucher Mountain Dog',
        avg_weight_kg: poundsToKg('40-65'),
        size_category: 'medium',
    },
    {
        breed: 'Eurasier',
        avg_weight_kg: poundsToKg('NA'),
        size_category: 'medium',
    },
    {
        breed: 'Field Spaniel',
        avg_weight_kg: poundsToKg('35-50'),
        size_category: 'medium',
    },
    {
        breed: 'Finnish Lapphund',
        avg_weight_kg: poundsToKg('33-53'),
        size_category: 'medium',
    },
    {
        breed: 'Finnish Spitz',
        avg_weight_kg: poundsToKg('20-33'),
        size_category: 'medium',
    },
    {
        breed: 'Flat-Coated Retriever',
        avg_weight_kg: poundsToKg('60-70'),
        size_category: 'medium',
    },
    {
        breed: 'French Spaniel',
        avg_weight_kg: poundsToKg('50-60'),
        size_category: 'medium',
    },
    {
        breed: 'German Pinscher',
        avg_weight_kg: poundsToKg('25-45'),
        size_category: 'medium',
    },
    {
        breed: 'German Shorthaired Pointer',
        avg_weight_kg: poundsToKg('45-70'),
        size_category: 'medium',
    },
    {
        breed: 'German Wirehaired Pointer',
        avg_weight_kg: poundsToKg('50-70'),
        size_category: 'medium',
    },
    {
        breed: 'Grand Basset Griffon Vendeen',
        avg_weight_kg: poundsToKg('40-45'),
        size_category: 'medium',
    },
    {
        breed: 'Hamiltonstovare',
        avg_weight_kg: poundsToKg('40-75'),
        size_category: 'medium',
    },
    {
        breed: 'Harrier',
        avg_weight_kg: poundsToKg('45-60'),
        size_category: 'medium',
    },
    {
        breed: 'Hokkaido',
        avg_weight_kg: poundsToKg('44-66'),
        size_category: 'medium',
    },
    {
        breed: 'Icelandic Sheepdog',
        avg_weight_kg: poundsToKg('25-30'),
        size_category: 'medium',
    },
    {
        breed: 'Irish terrier',
        avg_weight_kg: poundsToKg('25-27'),
        size_category: 'medium',
    },
    {
        breed: 'Japanese Akitainu',
        avg_weight_kg: poundsToKg('55-75'),
        size_category: 'medium',
    },
    {
        breed: 'Japanese Spitz',
        avg_weight_kg: poundsToKg('10-25'),
        size_category: 'medium',
    },
    {
        breed: 'Jindo',
        avg_weight_kg: poundsToKg('30-50'),
        size_category: 'medium',
    },
    {
        breed: 'Kai Ken',
        avg_weight_kg: poundsToKg('20-40'),
        size_category: 'medium',
    },
    {
        breed: 'Karelian Bear Dog',
        avg_weight_kg: poundsToKg('44-49'),
        size_category: 'medium',
    },
    {
        breed: 'Keeshond',
        avg_weight_kg: poundsToKg('35-45'),
        size_category: 'medium',
    },
    {
        breed: 'Kerry Blue Terrier',
        avg_weight_kg: poundsToKg('33-40'),
        size_category: 'medium',
    },
    {
        breed: 'Kishu Ken',
        avg_weight_kg: poundsToKg('30-60'),
        size_category: 'medium',
    },
    {
        breed: 'Kromfohrlander',
        avg_weight_kg: poundsToKg('20-35'),
        size_category: 'medium',
    },
    {
        breed: 'Lagotto Romagnolo',
        avg_weight_kg: poundsToKg('24-35'),
        size_category: 'medium',
    },
    {
        breed: 'Lapponian Herder',
        avg_weight_kg: poundsToKg(70),
        size_category: 'medium',
    },
    {
        breed: 'Miniature American Shepherd',
        avg_weight_kg: poundsToKg('20-40'),
        size_category: 'medium',
    },
    {
        breed: 'Mountain Cur',
        avg_weight_kg: poundsToKg('30-60'),
        size_category: 'medium',
    },
    {
        breed: 'Mudi',
        avg_weight_kg: poundsToKg('18-29'),
        size_category: 'medium',
    },
    {
        breed: 'Nederlandse Kooikerhondje',
        avg_weight_kg: poundsToKg('20-30'),
        size_category: 'medium',
    },
    {
        breed: 'Norwegian Buhund',
        avg_weight_kg: poundsToKg('26-40'),
        size_category: 'medium',
    },
    {
        breed: 'Norwegian Elkhound',
        avg_weight_kg: poundsToKg('48-50'),
        size_category: 'medium',
    },
    {
        breed: 'Nova Scotia Duck Tolling Retriever',
        avg_weight_kg: poundsToKg('35-50'),
        size_category: 'medium',
    },
    {
        breed: 'Petit Basset Griffon Vendeen',
        avg_weight_kg: poundsToKg('25-40'),
        size_category: 'medium',
    },
    {
        breed: 'Pharaoh Hound',
        avg_weight_kg: poundsToKg('45-55'),
        size_category: 'medium',
    },
    {
        breed: 'Plott Hound',
        avg_weight_kg: poundsToKg('NA'),
        size_category: 'medium',
    },
    {
        breed: 'Polish Lowland Sheepdog',
        avg_weight_kg: poundsToKg('30-50'),
        size_category: 'medium',
    },
    {
        breed: 'Standard Poodle',
        avg_weight_kg: poundsToKg('40-70'),
        size_category: 'medium',
    },
    {
        breed: 'Porcelaine',
        avg_weight_kg: poundsToKg('55-62'),
        size_category: 'medium',
    },
    {
        breed: 'Portuguese Podengo',
        avg_weight_kg: poundsToKg('44-66'),
        size_category: 'medium',
    },
    {
        breed: 'Portuguese Pointer',
        avg_weight_kg: poundsToKg('35-59'),
        size_category: 'medium',
    },
    {
        breed: 'Potuguese Sheepdog',
        avg_weight_kg: poundsToKg('37.5-59'),
        size_category: 'medium',
    },
    {
        breed: 'Portuguese Water Dog',
        avg_weight_kg: poundsToKg('35-60'),
        size_category: 'medium',
    },
    {
        breed: 'Pudelpointer',
        avg_weight_kg: poundsToKg('45-70'),
        size_category: 'medium',
    },
    {
        breed: 'Puli',
        avg_weight_kg: poundsToKg('25-35'),
        size_category: 'medium',
    },
    {
        breed: 'Pyrenean Shepherd',
        avg_weight_kg: poundsToKg('15-30'),
        size_category: 'medium',
    },
    {
        breed: 'Samoyed',
        avg_weight_kg: poundsToKg('35-65'),
        size_category: 'medium',
    },
    {
        breed: 'Schapendoes',
        avg_weight_kg: poundsToKg('26-55'),
        size_category: 'medium',
    },
    {
        breed: 'Segugio Italiano',
        avg_weight_kg: poundsToKg('40-60'),
        size_category: 'medium',
    },
    {
        breed: 'Shikoku',
        avg_weight_kg: poundsToKg('35-55'),
        size_category: 'medium',
    },
    {
        breed: 'Siberian Husky',
        avg_weight_kg: poundsToKg('35-60'),
        size_category: 'medium',
    },
    {
        breed: 'Skye Terrier',
        avg_weight_kg: poundsToKg('35-45'),
        size_category: 'medium',
    },
    {
        breed: 'Slovakian Wirehaired Pointer',
        avg_weight_kg: poundsToKg('50-65'),
        size_category: 'medium',
    },
    {
        breed: 'Slovensky Kopov',
        avg_weight_kg: poundsToKg('33-44'),
        size_category: 'medium',
    },
    {
        breed: 'small Munsterlander',
        avg_weight_kg: poundsToKg('40-60'),
        size_category: 'medium',
    },
    {
        breed: 'Soft Coated Wheaten Terrier',
        avg_weight_kg: poundsToKg('30-40'),
        size_category: 'medium',
    },
    {
        breed: 'Spanish Water Dog',
        avg_weight_kg: poundsToKg('31-49'),
        size_category: 'medium',
    },
    {
        breed: 'Stabyhoun',
        avg_weight_kg: poundsToKg('40-60'),
        size_category: 'medium',
    },
    {
        breed: 'Staffordshire Bull Terrier',
        avg_weight_kg: poundsToKg('24-38'),
        size_category: 'medium',
    },
    {
        breed: 'Standard Schnauzer',
        avg_weight_kg: poundsToKg('30-50'),
        size_category: 'medium',
    },
    {
        breed: 'Sussex Spaniel',
        avg_weight_kg: poundsToKg('35-45'),
        size_category: 'medium',
    },
    {
        breed: 'Swedish Lapphund',
        avg_weight_kg: poundsToKg('30-45'),
        size_category: 'medium',
    },
    {
        breed: 'Taiwan Dog',
        avg_weight_kg: poundsToKg('26-40'),
        size_category: 'medium',
    },
    {
        breed: 'Thai Ridgeback',
        avg_weight_kg: poundsToKg('35-75'),
        size_category: 'medium',
    },
    {
        breed: 'Transylvanian Hound',
        avg_weight_kg: poundsToKg('>55'),
        size_category: 'medium',
    },
    {
        breed: 'Treeing Tennessee Brindle',
        avg_weight_kg: poundsToKg('30-50'),
        size_category: 'medium',
    },
    {
        breed: 'Vizsla',
        avg_weight_kg: poundsToKg('44-60'),
        size_category: 'medium',
    },
    {
        breed: 'Volpino Italiano',
        avg_weight_kg: poundsToKg('8-16'),
        size_category: 'medium',
    },
    {
        breed: 'Welsh Springer Spaniel',
        avg_weight_kg: poundsToKg('35-55'),
        size_category: 'medium',
    },
    {
        breed: 'Whippet',
        avg_weight_kg: poundsToKg('25-40'),
        size_category: 'medium',
    },
    {
        breed: 'Wirehaired Pointing Griffon',
        avg_weight_kg: poundsToKg('35-70'),
        size_category: 'medium',
    },
    {
        breed: 'Wirehaired Vizsla',
        avg_weight_kg: poundsToKg('45-65'),
        size_category: 'medium',
    },
    {
        breed: 'Working Kelpie',
        avg_weight_kg: poundsToKg('28-60'),
        size_category: 'medium',
    },
    {
        breed: 'Xoloitzcuintli',
        avg_weight_kg: poundsToKg('30-55'),
        size_category: 'medium',
    },
    {
        breed: 'Yakutian Laika',
        avg_weight_kg: poundsToKg('40-55'),
        size_category: 'medium',
    },
    {
        breed: 'Afghan hound',
        avg_weight_kg: poundsToKg('50-60'),
        size_category: 'large',
    },
    {
        breed: 'Alaskan Malamute',
        avg_weight_kg: poundsToKg('75-85'),
        size_category: 'large',
    },
    {
        breed: 'American Bulldog',
        avg_weight_kg: poundsToKg('60-100'),
        size_category: 'large',
    },
    {
        breed: 'Azawakh',
        avg_weight_kg: poundsToKg('33-55'),
        size_category: 'large',
    },
    {
        breed: 'Beauceron',
        avg_weight_kg: poundsToKg('70-110'),
        size_category: 'large',
    },
    {
        breed: 'Belgian Laekenois',
        avg_weight_kg: poundsToKg('55-65'),
        size_category: 'large',
    },
    {
        breed: 'Belgian Malinois',
        avg_weight_kg: poundsToKg('40-80'),
        size_category: 'large',
    },
    {
        breed: 'Belgian Sheepdog',
        avg_weight_kg: poundsToKg('45-75'),
        size_category: 'large',
    },
    {
        breed: 'Belgian Tervuren',
        avg_weight_kg: poundsToKg('45-75'),
        size_category: 'large',
    },
    {
        breed: 'Berger Picard',
        avg_weight_kg: poundsToKg('50-70'),
        size_category: 'large',
    },
    {
        breed: 'Black and Tan Coonhound',
        avg_weight_kg: poundsToKg('65-110'),
        size_category: 'large',
    },
    {
        breed: 'Black Russian Terrier',
        avg_weight_kg: poundsToKg('80-130'),
        size_category: 'large',
    },
    {
        breed: 'Bloodhound',
        avg_weight_kg: poundsToKg('80-110'),
        size_category: 'large',
    },
    {
        breed: 'Borzoi',
        avg_weight_kg: poundsToKg('60-105'),
        size_category: 'large',
    },
    {
        breed: 'Bouvier des Flandres',
        avg_weight_kg: poundsToKg('70-110'),
        size_category: 'large',
    },
    {
        breed: 'Boxer',
        avg_weight_kg: poundsToKg('65-80'),
        size_category: 'large',
    },
    {
        breed: 'Bracco Italiano',
        avg_weight_kg: poundsToKg('55-90'),
        size_category: 'large',
    },
    {
        breed: 'Briard',
        avg_weight_kg: poundsToKg('55-100'),
        size_category: 'large',
    },
    {
        breed: 'Cane Corso',
        avg_weight_kg: poundsToKg('NA'),
        size_category: 'large',
    },
    {
        breed: 'Catahoula Leopard Dog',
        avg_weight_kg: poundsToKg('50-95'),
        size_category: 'large',
    },
    {
        breed: 'Central Asian Shepherd Dog',
        avg_weight_kg: poundsToKg('88-110'),
        size_category: 'large',
    },
    {
        breed: 'Chesapeake Bay Retriever',
        avg_weight_kg: poundsToKg('55-80'),
        size_category: 'large',
    },
    {
        breed: 'Chinook',
        avg_weight_kg: poundsToKg('50-90'),
        size_category: 'large',
    },
    {
        breed: 'Curly-Coated Retriever',
        avg_weight_kg: poundsToKg('60-95'),
        size_category: 'large',
    },
    {
        breed: 'Doberman Pinscher',
        avg_weight_kg: poundsToKg('60-100'),
        size_category: 'large',
    },
    {
        breed: 'Dogo Argentino',
        avg_weight_kg: poundsToKg('80-100'),
        size_category: 'large',
    },
    {
        breed: 'Estrela Mountain Dog',
        avg_weight_kg: poundsToKg('77-132'),
        size_category: 'large',
    },
    {
        breed: 'German Longhaired Pointer',
        avg_weight_kg: poundsToKg('55-80'),
        size_category: 'large',
    },
    {
        breed: 'German Shepherd Dog',
        avg_weight_kg: poundsToKg('50-90'),
        size_category: 'large',
    },
    {
        breed: 'Giant Schnauzer',
        avg_weight_kg: poundsToKg('55-85'),
        size_category: 'large',
    },
    {
        breed: 'Golden Retriever',
        avg_weight_kg: poundsToKg('55-75'),
        size_category: 'large',
    },
    {
        breed: 'Gordon Setter',
        avg_weight_kg: poundsToKg('45-80'),
        size_category: 'large',
    },
    {
        breed: 'Greyhound',
        avg_weight_kg: poundsToKg('60-70'),
        size_category: 'large',
    },
    {
        breed: 'Hanoverian Scenthound',
        avg_weight_kg: poundsToKg('79-99'),
        size_category: 'large',
    },
    {
        breed: 'Hovawart',
        avg_weight_kg: poundsToKg('65-90'),
        size_category: 'large',
    },
    {
        breed: 'Ibizan Hound',
        avg_weight_kg: poundsToKg('45-50'),
        size_category: 'large',
    },
    {
        breed: 'Irish Red and White Setter',
        avg_weight_kg: poundsToKg('35-60'),
        size_category: 'large',
    },
    {
        breed: 'Irish Setter',
        avg_weight_kg: poundsToKg('60-70'),
        size_category: 'large',
    },
    {
        breed: 'Irish Water Spaniel',
        avg_weight_kg: poundsToKg('45-68'),
        size_category: 'large',
    },
    {
        breed: 'Komondor',
        avg_weight_kg: poundsToKg('80-100'),
        size_category: 'large',
    },
    {
        breed: 'Kuvasz',
        avg_weight_kg: poundsToKg('70-115'),
        size_category: 'large',
    },
    {
        breed: 'Labrador Retriever',
        avg_weight_kg: poundsToKg('55-80'),
        size_category: 'large',
    },
    {
        breed: 'Old English Sheepdog',
        avg_weight_kg: poundsToKg('60-100'),
        size_category: 'large',
    },
    {
        breed: 'Otterhound',
        avg_weight_kg: poundsToKg('80-115'),
        size_category: 'large',
    },
    {
        breed: 'Perro de Presa Canario',
        avg_weight_kg: poundsToKg('84-110'),
        size_category: 'large',
    },
    {
        breed: 'Pointer',
        avg_weight_kg: poundsToKg('45-75'),
        size_category: 'large',
    },
    {
        breed: 'Rafeiro do Alentejo',
        avg_weight_kg: poundsToKg('77-132'),
        size_category: 'large',
    },
    {
        breed: 'Redbone Coonhound',
        avg_weight_kg: poundsToKg('45-70'),
        size_category: 'large',
    },
    {
        breed: 'Rhodesian Ridgeback',
        avg_weight_kg: poundsToKg('70-85'),
        size_category: 'large',
    },
    {
        breed: 'Rottweiler',
        avg_weight_kg: poundsToKg('80-135'),
        size_category: 'large',
    },
    {
        breed: 'Saluki',
        avg_weight_kg: poundsToKg('40-65'),
        size_category: 'large',
    },
    {
        breed: 'Sloughi',
        avg_weight_kg: poundsToKg('35-50'),
        size_category: 'large',
    },
    {
        breed: 'Slovensky Cuvac',
        avg_weight_kg: poundsToKg('68-97'),
        size_category: 'large',
    },
    {
        breed: 'Tornjak',
        avg_weight_kg: poundsToKg('62-110'),
        size_category: 'large',
    },
    {
        breed: 'Tosa',
        avg_weight_kg: poundsToKg('100-200'),
        size_category: 'large',
    },
    {
        breed: 'Treeing Walker Coonhound',
        avg_weight_kg: poundsToKg('50-70'),
        size_category: 'large',
    },
    {
        breed: 'Weimaraner',
        avg_weight_kg: poundsToKg('55-90'),
        size_category: 'large',
    },
    {
        breed: 'Wetterhoun',
        avg_weight_kg: poundsToKg('50-75'),
        size_category: 'large',
    },
    {
        breed: 'Akita',
        avg_weight_kg: poundsToKg('70-130'),
        size_category: 'giant',
    },
    {
        breed: 'Anatolian Shepherd Dog',
        avg_weight_kg: poundsToKg('80-150'),
        size_category: 'giant',
    },
    {
        breed: 'Bernese Mountain Dog',
        avg_weight_kg: poundsToKg('70-115'),
        size_category: 'giant',
    },
    {
        breed: 'Boerboel',
        avg_weight_kg: poundsToKg('150-200'),
        size_category: 'giant',
    },
    {
        breed: 'Broholmer',
        avg_weight_kg: poundsToKg('90-150'),
        size_category: 'giant',
    },
    {
        breed: 'Bullmastiff',
        avg_weight_kg: poundsToKg('100-130'),
        size_category: 'giant',
    },
    {
        breed: 'Caucasian Shepherd Dog',
        avg_weight_kg: poundsToKg('99-170'),
        size_category: 'giant',
    },
    {
        breed: 'Dogue de Bordeaux',
        avg_weight_kg: poundsToKg('99-110'),
        size_category: 'giant',
    },
    {
        breed: 'Great Dane',
        avg_weight_kg: poundsToKg('110-175'),
        size_category: 'giant',
    },
    {
        breed: 'Great Pyrenees',
        avg_weight_kg: poundsToKg('85-100'),
        size_category: 'giant',
    },
    {
        breed: 'Greater Swiss Mountain Dog',
        avg_weight_kg: poundsToKg('85-140'),
        size_category: 'giant',
    },
    {
        breed: 'Irish Wolfhound',
        avg_weight_kg: poundsToKg('105-120'),
        size_category: 'giant',
    },
    {
        breed: 'Leonberger',
        avg_weight_kg: poundsToKg('90-170'),
        size_category: 'giant',
    },
    {
        breed: 'Mastiff',
        avg_weight_kg: poundsToKg('120-230'),
        size_category: 'giant',
    },
    {
        breed: 'Neapolitan Mastiff',
        avg_weight_kg: poundsToKg('110-150'),
        size_category: 'giant',
    },
    {
        breed: 'Newfoundland',
        avg_weight_kg: poundsToKg('100-150'),
        size_category: 'giant',
    },
    {
        breed: 'Pyrenean Mastiff',
        avg_weight_kg: poundsToKg('120-240'),
        size_category: 'giant',
    },
    {
        breed: 'Romanian Mioritic shepherd Dog',
        avg_weight_kg: poundsToKg('100-130'),
        size_category: 'giant',
    },
    {
        breed: 'Saint Bernard',
        avg_weight_kg: poundsToKg('120-180'),
        size_category: 'giant',
    },
    {
        breed: 'Scottish Deerhound',
        avg_weight_kg: poundsToKg('75-110'),
        size_category: 'giant',
    },
    {
        breed: 'Spanish Mastiff',
        avg_weight_kg: poundsToKg('140-200'),
        size_category: 'giant',
    },
    {
        breed: 'Tibetan Mastiff',
        avg_weight_kg: poundsToKg('70-150'),
        size_category: 'giant',
    },
];
