export interface ProvinciaUbigeo {
  nombre: string;
  distritos: string[];
}

export interface RegionUbigeo {
  nombre: string;
  provincias: ProvinciaUbigeo[];
}

export const PERU_UBIGEO: RegionUbigeo[] = [
  {
    nombre: 'Amazonas',
    provincias: [
      {
        nombre: 'Chachapoyas',
        distritos: [
          'Chachapoyas',
          'Asunción',
          'Balsas',
          'Cheto',
          'Chiliquín',
          'Chuquibamba',
          'Granada',
          'Huancas',
          'La Jalca',
          'Leimebamba',
          'Levanto',
          'Magdalena',
          'Mariscal Castilla',
          'Molinopampa',
          'Montevideo',
          'Olleros',
          'Quinjalca',
          'San Francisco de Daguas',
          'San Isidro de Maino',
          'Soloco',
          'Sonche'
        ]
      },
      {
        nombre: 'Bagua',
        distritos: ['Bagua', 'Aramango', 'Copallín', 'El Parco', 'Imaza', 'La Peca']
      },
      {
        nombre: 'Bongará',
        distritos: [
          'Jumbilla',
          'Chisquilla',
          'Churuja',
          'Corosha',
          'Cuispes',
          'Florida',
          'Jazán',
          'Recta',
          'San Carlos',
          'Shipasbamba',
          'Valera',
          'Yambrasbamba'
        ]
      },
      {
        nombre: 'Condorcanqui',
        distritos: ['Nieva', 'El Cenepa', 'Río Santiago']
      },
      {
        nombre: 'Luya',
        distritos: [
          'Lámud',
          'Camporredondo',
          'Cocabamba',
          'Colcamar',
          'Conila',
          'Inguilpata',
          'Longuita',
          'Lonya Chico',
          'Luya',
          'Luya Viejo',
          'María',
          'Ocallí',
          'Ocumal',
          'Pisuquia',
          'Providencia',
          'San Cristóbal',
          'San Francisco del Yeso',
          'San Jerónimo',
          'San Juan de Lopecancha',
          'Santa Catalina',
          'Santo Tomás',
          'Tingo',
          'Trita'
        ]
      },
      {
        nombre: 'Rodríguez de Mendoza',
        distritos: [
          'San Nicolás',
          'Chirimoto',
          'Cochamal',
          'Huambo',
          'Limabamba',
          'Longar',
          'Mariscal Benavides',
          'Mílpuc',
          'Omia',
          'Santa Rosa',
          'Totora',
          'Vista Alegre'
        ]
      },
      {
        nombre: 'Utcubamba',
        distritos: [
          'Bagua Grande',
          'Cajaruro',
          'Cumba',
          'El Milagro',
          'Jamalca',
          'Lonya Grande',
          'Yamón'
        ]
      }
    ]
  },
  {
    nombre: 'Áncash',
    provincias: [
      {
        nombre: 'Huaraz',
        distritos: [
          'Huaraz',
          'Cochabamba',
          'Colcabamba',
          'Huanchay',
          'Independencia',
          'Jangas',
          'La Libertad',
          'Olleros',
          'Pampas Grande',
          'Pariacoto',
          'Pira',
          'Tarica'
        ]
      },
      { nombre: 'Aija', distritos: ['Aija', 'Coris', 'Huacllán', 'La Merced', 'Succha'] },
      {
        nombre: 'Antonio Raymondi',
        distritos: ['Llamellín', 'Aczo', 'Chaccho', 'Chingas', 'Mirgas', 'San Juan de Rontoy']
      },
      { nombre: 'Asunción', distritos: ['Chacas', 'Acochaca'] },
      {
        nombre: 'Bolognesi',
        distritos: [
          'Chiquián',
          'Abelardo Pardo Lezameta',
          'Antonio Raymondi',
          'Aquia',
          'Cajacay',
          'Canis',
          'Colquioc',
          'Huallanca',
          'Huasta',
          'Huayllacayán',
          'La Primavera',
          'Mangas',
          'Pacllón',
          'San Miguel de Corpanqui',
          'Ticllos'
        ]
      },
      {
        nombre: 'Carhuaz',
        distritos: [
          'Carhuaz',
          'Acopampa',
          'Amashca',
          'Anta',
          'Ataquero',
          'Marcará',
          'Pariahuanca',
          'San Miguel de Aco',
          'Shilla',
          'Tinco',
          'Yungar'
        ]
      },
      {
        nombre: 'Carlos Fermín Fitzcarrald',
        distritos: ['San Luis', 'San Nicolás', 'Yauya']
      },
      {
        nombre: 'Casma',
        distritos: ['Casma', 'Buena Vista Alta', 'Comandante Noel', 'Yaután']
      },
      {
        nombre: 'Corongo',
        distritos: ['Corongo', 'Aco', 'Bambas', 'Cusca', 'La Pampa', 'Yánac', 'Yupán']
      },
      {
        nombre: 'Huari',
        distritos: [
          'Huari',
          'Anra',
          'Cajay',
          'Chavín de Huántar',
          'Huacachi',
          'Huacchis',
          'Huachis',
          'Huántar',
          'Masin',
          'Paucas',
          'Pontó',
          'Rahuapampa',
          'Rapayán',
          'San Marcos',
          'San Pedro de Chaná',
          'Uco'
        ]
      },
      {
        nombre: 'Huarmey',
        distritos: ['Huarmey', 'Cochapeti', 'Culebras', 'Huayan', 'Malvas']
      },
      {
        nombre: 'Huaylas',
        distritos: [
          'Caraz',
          'Huallanca',
          'Huata',
          'Huaylas',
          'Mato',
          'Pamparomás',
          'Pueblo Libre',
          'Santa Cruz',
          'Santo Toribio',
          'Yuracmarca'
        ]
      },
      {
        nombre: 'Mariscal Luzuriaga',
        distritos: [
          'Piscobamba',
          'Casca',
          'Eleazar Guzmán Barrón',
          'Fidel Olivas Escudero',
          'Llama',
          'Llumpa',
          'Lucma',
          'Musga'
        ]
      },
      {
        nombre: 'Ocros',
        distritos: [
          'Ocros',
          'Acas',
          'Cajamarquilla',
          'Carhuapampa',
          'Cochas',
          'Congas',
          'Llipa',
          'San Cristóbal de Raján',
          'San Pedro',
          'Santiago de Chilcas'
        ]
      },
      {
        nombre: 'Pallasca',
        distritos: [
          'Cabana',
          'Bolognesi',
          'Conchucos',
          'Huacaschuque',
          'Huandoval',
          'Lacabamba',
          'Llapo',
          'Pallasca',
          'Pampas',
          'Santa Rosa',
          'Tauca'
        ]
      },
      {
        nombre: 'Pomabamba',
        distritos: ['Pomabamba', 'Huayllán', 'Parobamba', 'Quinuabamba']
      },
      {
        nombre: 'Recuay',
        distritos: [
          'Recuay',
          'Cátac',
          'Cotaparaco',
          'Huayllapampa',
          'Llacllín',
          'Marca',
          'Pampas Chico',
          'Pararín',
          'Tapacocha',
          'Ticapampa'
        ]
      },
      {
        nombre: 'Santa',
        distritos: [
          'Chimbote',
          'Nuevo Chimbote',
          'Cáceres del Perú',
          'Coishco',
          'Macate',
          'Moro',
          'Nepeña',
          'Samanco',
          'Santa'
        ]
      },
      {
        nombre: 'Sihuas',
        distritos: [
          'Sihuas',
          'Acobamba',
          'Alfonso Ugarte',
          'Cashapampa',
          'Chingalpo',
          'Huayllabamba',
          'Quiches',
          'Ragash',
          'San Juan',
          'Sicsibamba'
        ]
      },
      {
        nombre: 'Yungay',
        distritos: [
          'Yungay',
          'Cascapara',
          'Mancos',
          'Matacoto',
          'Quillo',
          'Ranrahirca',
          'Shupluy',
          'Yanama'
        ]
      }
    ]
  },
  {
    nombre: 'Apurímac',
    provincias: [
      {
        nombre: 'Abancay',
        distritos: [
          'Abancay',
          'Chacoche',
          'Circa',
          'Curahuasi',
          'Huanipaca',
          'Lambrama',
          'Pichirhua',
          'San Pedro de Cachora',
          'Tamburco'
        ]
      },
      {
        nombre: 'Andahuaylas',
        distritos: [
          'Andahuaylas',
          'Andarapa',
          'Chiara',
          'Huancarama',
          'Huancaray',
          'Huayana',
          'José María Arguedas',
          'Kaquiabamba',
          'Kishuará',
          'Pacobamba',
          'Pacucha',
          'Pampachiri',
          'Pomacocha',
          'San Antonio de Cachi',
          'San Jerónimo',
          'San Miguel de Chaccrampa',
          'Santa María de Chicmo',
          'Talavera',
          'Tumay Huaraca',
          'Turpo'
        ]
      },
      {
        nombre: 'Antabamba',
        distritos: [
          'Antabamba',
          'El Oro',
          'Huaquirca',
          'Juan Espinoza Medrano',
          'Oropesa',
          'Pachaconas',
          'Sabaino'
        ]
      },
      {
        nombre: 'Aymaraes',
        distritos: [
          'Chalhuanca',
          'Capaya',
          'Caraybamba',
          'Chapimarca',
          'Colcabamba',
          'Cotaruse',
          'Huayllo',
          'Justo Apu Sahuaraura',
          'Lucre',
          'Pocohuanca',
          'San Juan de Chacña',
          'Sañayca',
          'Soraya',
          'Tapairihua',
          'Tintay',
          'Toraya',
          'Yanaca'
        ]
      },
      {
        nombre: 'Cotabambas',
        distritos: ['Tambobamba', 'Challhuahuacho', 'Cotabambas', 'Coyllurqui', 'Haquira', 'Mara']
      },
      {
        nombre: 'Chincheros',
        distritos: [
          'Chincheros',
          'Ahuayro',
          'Anco_Huallo',
          'Cocharcas',
          'El Porvenir',
          'Huaccana',
          'Los Chankas',
          'Ocobamba',
          'Ongoy',
          'Ranracancha',
          'Rocchacc',
          'Uranmarca'
        ]
      },
      {
        nombre: 'Grau',
        distritos: [
          'Chuquibambilla',
          'Curasco',
          'Curpahuasi',
          'Gamarra',
          'Huayllati',
          'Mamara',
          'Micaela Bastidas',
          'Pataypampa',
          'Progreso',
          'San Antonio',
          'Santa Rosa',
          'Turpay',
          'Vilcabamba',
          'Virundo'
        ]
      }
    ]
  },
  {
    nombre: 'Arequipa',
    provincias: [
      {
        nombre: 'Arequipa',
        distritos: [
          'Arequipa',
          'Alto Selva Alegre',
          'Cayma',
          'Cerro Colorado',
          'Characato',
          'Chiguata',
          'Jacobo Hunter',
          'José Luis Bustamante y Rivero',
          'La Joya',
          'Mariano Melgar',
          'Miraflores',
          'Mollebaya',
          'Paucarpata',
          'Pocsi',
          'Polobaya',
          'Quequeña',
          'Sabandía',
          'Sachaca',
          'San Juan de Siguas',
          'San Juan de Tarucani',
          'Santa Isabel de Siguas',
          'Santa Rita de Siguas',
          'Socabaya',
          'Tiabaya',
          'Uchumayo',
          'Vítor',
          'Yanahuara',
          'Yarabamba',
          'Yura'
        ]
      },
      {
        nombre: 'Camaná',
        distritos: [
          'Camaná',
          'José María Quimper',
          'Mariano Nicolás Valcárcel',
          'Mariscal Cáceres',
          'Nicolás de Piérola',
          'Ocoña',
          'Quilca',
          'Samuel Pastor'
        ]
      },
      {
        nombre: 'Caravelí',
        distritos: [
          'Caravelí',
          'Acarí',
          'Atico',
          'Atiquipa',
          'Bella Unión',
          'Cahuacho',
          'Chala',
          'Chaparra',
          'Huanuhuanu',
          'Jaqui',
          'Lomas',
          'Quicacha',
          'Yauca'
        ]
      },
      {
        nombre: 'Castilla',
        distritos: [
          'Aplao',
          'Andagua',
          'Ayo',
          'Chachas',
          'Chilcaymarca',
          'Choco',
          'Huancarqui',
          'Machaguay',
          'Orcopampa',
          'Pampacolca',
          'Tipán',
          'Uñón',
          'Uraca',
          'Viraco'
        ]
      },
      {
        nombre: 'Caylloma',
        distritos: [
          'Chivay',
          'Achoma',
          'Cabanaconde',
          'Callalli',
          'Caylloma',
          'Coporaque',
          'Huambo',
          'Huanca',
          'Ichupampa',
          'Lari',
          'Lluta',
          'Maca',
          'Madrigal',
          'Majes',
          'San Antonio de Chuca',
          'Sibayo',
          'Tapay',
          'Tisco',
          'Tuti',
          'Yanque'
        ]
      },
      {
        nombre: 'Condesuyos',
        distritos: [
          'Chuquibamba',
          'Andaray',
          'Cayarani',
          'Chichas',
          'Iray',
          'Río Grande',
          'Salamanca',
          'Yanaquihua'
        ]
      },
      {
        nombre: 'Islay',
        distritos: [
          'Mollendo',
          'Cocachacra',
          'Dean Valdivia',
          'Islay',
          'Mejía',
          'Punta de Bombón'
        ]
      },
      {
        nombre: 'La Unión',
        distritos: [
          'Cotahuasi',
          'Alca',
          'Charcana',
          'Huaynacotas',
          'Pampamarca',
          'Puyca',
          'Quechualla',
          'Sayla',
          'Tauría',
          'Tomepampa',
          'Toro'
        ]
      }
    ]
  },
  {
    nombre: 'Ayacucho',
    provincias: [
      {
        nombre: 'Huamanga',
        distritos: [
          'Ayacucho',
          'Acocro',
          'Acos Vinchos',
          'Andrés Avelino Cáceres Dorregaray',
          'Carmen Alto',
          'Chiara',
          'Jesús Nazareno',
          'Ocros',
          'Pacaycasa',
          'Quinua',
          'San José de Ticllas',
          'San Juan Bautista',
          'Santiago de Pischa',
          'Socos',
          'Tambillo',
          'Vinchos'
        ]
      },
      {
        nombre: 'Cangallo',
        distritos: [
          'Cangallo',
          'Chuschi',
          'Los Morochucos',
          'María Parado de Bellido',
          'Paras',
          'Totos'
        ]
      },
      {
        nombre: 'Huanca Sancos',
        distritos: ['Sancos', 'Carapo', 'Sacsamarca', 'Santiago de Lucanamarca']
      },
      {
        nombre: 'Huanta',
        distritos: [
          'Huanta',
          'Ayahuanco',
          'Canayre',
          'Chaca',
          'Huamanguilla',
          'Iguain',
          'Llochegua',
          'Luricocha',
          'Pucacolpa',
          'Santillana',
          'Sivia',
          'Uchuraccay'
        ]
      },
      {
        nombre: 'La Mar',
        distritos: [
          'San Miguel',
          'Anco',
          'Anchihuay',
          'Ayna',
          'Chilcas',
          'Chungui',
          'Luis Carranza',
          'Oronccoy',
          'Samugari',
          'Santa Rosa',
          'Tambo'
        ]
      },
      {
        nombre: 'Lucanas',
        distritos: [
          'Puquio',
          'Aucara',
          'Cabana',
          'Carmen Salcedo',
          'Chaviña',
          'Chipao',
          'Huac-Huas',
          'Laramate',
          'Leoncio Prado',
          'Llauta',
          'Lucanas',
          'Ocaña',
          'Otoca',
          'Saisa',
          'San Cristóbal',
          'San Juan',
          'San Pedro',
          'San Pedro de Palco',
          'Sancos',
          'Santa Ana de Huaycahuacho',
          'Santa Lucía'
        ]
      },
      {
        nombre: 'Parinacochas',
        distritos: [
          'Coracora',
          'Chumpi',
          'Coronel Castañeda',
          'Pacapausa',
          'Pullo',
          'Puyusca',
          'San Francisco de Ravacayco',
          'Upahuacho'
        ]
      },
      {
        nombre: 'Páucar del Sara Sara',
        distritos: [
          'Pausa',
          'Colta',
          'Corculla',
          'Lampa',
          'Marcabamba',
          'Oyolo',
          'Pararca',
          'San Javier de Alpabamba',
          'San José de Ushua',
          'Sara Sara'
        ]
      },
      {
        nombre: 'Sucre',
        distritos: [
          'Querobamba',
          'Belén',
          'Chalcos',
          'Chilcayoc',
          'Huacaña',
          'Morcolla',
          'Paico',
          'San Pedro de Larcay',
          'San Salvador de Quije',
          'Santiago de Paucaray',
          'Soras'
        ]
      },
      {
        nombre: 'Víctor Fajardo',
        distritos: [
          'Huancapi',
          'Alcamenca',
          'Apongo',
          'Asquipata',
          'Canaria',
          'Cayara',
          'Colca',
          'Huamanquiquia',
          'Huancaraylla',
          'Huaya',
          'Sarhua',
          'Vilcanchos'
        ]
      },
      {
        nombre: 'Vilcas Huamán',
        distritos: [
          'Vilcas Huamán',
          'Accomarca',
          'Carhuanca',
          'Concepción',
          'Huambalpa',
          'Independencia',
          'Saurama',
          'Vischongo'
        ]
      }
    ]
  },
  {
    nombre: 'Cajamarca',
    provincias: [
      {
        nombre: 'Cajamarca',
        distritos: [
          'Cajamarca',
          'Asunción',
          'Baños del Inca',
          'Chetilla',
          'Cospán',
          'Encañada',
          'Jesús',
          'Llacanora',
          'Magdalena',
          'Matara',
          'Namora',
          'San Juan'
        ]
      },
      {
        nombre: 'Cajabamba',
        distritos: ['Cajabamba', 'Cachachi', 'Condebamba', 'Sitacocha']
      },
      {
        nombre: 'Celendín',
        distritos: [
          'Celendín',
          'Chumuch',
          'Cortegana',
          'Huasmin',
          'Jorge Chávez',
          'José Gálvez',
          'La Libertad de Pallán',
          'Miguel Iglesias',
          'Oxamarca',
          'Sorochuco',
          'Sucre',
          'Utco'
        ]
      },
      {
        nombre: 'Chota',
        distritos: [
          'Chota',
          'Anguía',
          'Chadín',
          'Chalamarca',
          'Chiguirip',
          'Chimban',
          'Choropampa',
          'Cochabamba',
          'Conchán',
          'Huambos',
          'Lajas',
          'Llama',
          'Miracosta',
          'Paccha',
          'Pión',
          'Querocoto',
          'San Juan de Licupis',
          'Tacabamba',
          'Tocmoche'
        ]
      },
      {
        nombre: 'Contumazá',
        distritos: [
          'Contumazá',
          'Chilete',
          'Cupisnique',
          'Guzmango',
          'San Benito',
          'Santa Cruz de Toledo',
          'Tantarica',
          'Yonán'
        ]
      },
      {
        nombre: 'Cutervo',
        distritos: [
          'Cutervo',
          'Callayuc',
          'Choros',
          'Cujillo',
          'La Ramada',
          'Pimpingos',
          'Querocotillo',
          'San Andrés de Cutervo',
          'San Juan de Cutervo',
          'San Luis de Lucma',
          'Santa Cruz',
          'Santo Domingo de la Capilla',
          'Santo Tomás',
          'Socota',
          'Toribio Casanova'
        ]
      },
      { nombre: 'Hualgayoc', distritos: ['Bambamarca', 'Chugur', 'Hualgayoc'] },
      {
        nombre: 'Jaén',
        distritos: [
          'Jaén',
          'Bellavista',
          'Chontali',
          'Colasay',
          'Huabal',
          'Las Pirias',
          'Pomahuaca',
          'Pucará',
          'Sallique',
          'San Felipe',
          'San José del Alto',
          'Santa Rosa'
        ]
      },
      {
        nombre: 'San Ignacio',
        distritos: [
          'San Ignacio',
          'Chirinos',
          'Huarango',
          'La Coipa',
          'Namballe',
          'San José de Lourdes',
          'Tabaconas'
        ]
      },
      {
        nombre: 'San Marcos',
        distritos: [
          'Pedro Gálvez',
          'Chancay',
          'Eduardo Villanueva',
          'Gregorio Pita',
          'Ichocán',
          'José Manuel Quiroz',
          'José Sabogal'
        ]
      },
      {
        nombre: 'San Miguel',
        distritos: [
          'San Miguel',
          'Bolívar',
          'Calquis',
          'Catilluc',
          'El Prado',
          'La Florida',
          'Llapa',
          'Nanchoc',
          'Niepos',
          'San Gregorio',
          'San Silvestre de Cochán',
          'Tongod',
          'Unión Agua Blanca'
        ]
      },
      {
        nombre: 'San Pablo',
        distritos: ['San Pablo', 'San Bernardino', 'San Luis', 'Tumbadén']
      },
      {
        nombre: 'Santa Cruz',
        distritos: [
          'Santa Cruz',
          'Andabamba',
          'Catache',
          'Chancaybaños',
          'La Esperanza',
          'Ninabamba',
          'Pulán',
          'Saucepampa',
          'Sexi',
          'Uticyacu',
          'Yauyucan'
        ]
      }
    ]
  },
  {
    nombre: 'Callao',
    provincias: [
      {
        nombre: 'Callao',
        distritos: [
          'Callao',
          'Bellavista',
          'Carmen de la Legua Reynoso',
          'La Perla',
          'La Punta',
          'Mi Perú',
          'Ventanilla'
        ]
      }
    ]
  },
  {
    nombre: 'Cusco',
    provincias: [
      {
        nombre: 'Cusco',
        distritos: [
          'Cusco',
          'Ccorca',
          'Poroy',
          'San Jerónimo',
          'San Sebastián',
          'Santiago',
          'Saylla',
          'Wanchaq'
        ]
      },
      {
        nombre: 'Acomayo',
        distritos: ['Acomayo', 'Acopia', 'Acos', 'Mosoc Llacta', 'Pomacanchi', 'Rondocan', 'Sangarará']
      },
      {
        nombre: 'Anta',
        distritos: [
          'Anta',
          'Ancahuasi',
          'Cachimayo',
          'Chinchaypujio',
          'Huarocondo',
          'Limatambo',
          'Mollepata',
          'Pucyura',
          'Zurite'
        ]
      },
      {
        nombre: 'Calca',
        distritos: ['Calca', 'Coya', 'Lamay', 'Lares', 'Pisac', 'San Salvador', 'Taray', 'Yanatile']
      },
      {
        nombre: 'Canas',
        distritos: ['Yanaoca', 'Checca', 'Kunturkanki', 'Langui', 'Layo', 'Pampamarca', 'Quehue', 'Túpac Amaru']
      },
      {
        nombre: 'Canchis',
        distritos: ['Sicuani', 'Checacupe', 'Combapata', 'Maranganí', 'Pitumarca', 'San Pablo', 'San Pedro', 'Tinta']
      },
      {
        nombre: 'Chumbivilcas',
        distritos: ['Santo Tomás', 'Capacmarca', 'Chamaca', 'Colquemarca', 'Livitaca', 'Llusco', 'Quiñota', 'Velille']
      },
      {
        nombre: 'Espinar',
        distritos: ['Espinar', 'Alto Pichigua', 'Condoroma', 'Coporaque', 'Ocoruro', 'Pallpata', 'Pichigua', 'Suyckutambo']
      },
      {
        nombre: 'La Convención',
        distritos: [
          'Santa Ana (Quillabamba)',
          'Echarate',
          'Huayopata',
          'Inkawasi',
          'Kimbiri',
          'Maranura',
          'Megantoni',
          'Ocobamba',
          'Pichari',
          'Quellouno',
          'Santa Teresa',
          'Vilcabamba',
          'Villa Kintiarina',
          'Villa Virgen'
        ]
      },
      {
        nombre: 'Paruro',
        distritos: ['Paruro', 'Accha', 'Ccapi', 'Colcha', 'Huanoquite', 'Omacha', 'Paccaritambo', 'Pillpinto', 'Yaurisque']
      },
      {
        nombre: 'Paucartambo',
        distritos: ['Paucartambo', 'Caicay', 'Challabamba', 'Colquepata', 'Huancarani', 'Kosñipata']
      },
      {
        nombre: 'Quispicanchi',
        distritos: [
          'Urcos',
          'Andahuaylillas',
          'Camanti',
          'Ccarhuayo',
          'Ccatca',
          'Cusipata',
          'Huaro',
          'Lucre',
          'Marcapata',
          'Ocongate',
          'Oropesa',
          'Quiquijana'
        ]
      },
      {
        nombre: 'Urubamba',
        distritos: ['Urubamba', 'Chinchero', 'Huayllabamba', 'Machupicchu', 'Maras', 'Ollantaytambo', 'Yucay']
      }
    ]
  },
  {
    nombre: 'Huancavelica',
    provincias: [
      {
        nombre: 'Huancavelica',
        distritos: [
          'Huancavelica',
          'Acobambilla',
          'Acoria',
          'Ascensión',
          'Conayca',
          'Cuenca',
          'Huachocolpa',
          'Huando',
          'Huayllahuara',
          'Izcuchaca',
          'Laria',
          'Manta',
          'Mariscal Cáceres',
          'Moya',
          'Nuevo Occoro',
          'Palca',
          'Pilchaca',
          'Vilca',
          'Yauli'
        ]
      },
      {
        nombre: 'Acobamba',
        distritos: ['Acobamba', 'Andabamba', 'Anta', 'Caja', 'Marcas', 'Paucará', 'Pomacocha', 'Rosario']
      },
      {
        nombre: 'Angaraes',
        distritos: [
          'Lircay',
          'Anchonga',
          'Callanmarca',
          'Ccochaccasa',
          'Chincho',
          'Congalla',
          'Huanca-Huanca',
          'Huayllay Grande',
          'Julcamarca',
          'San Antonio de Antaparco',
          'Santo Tomás de Pata',
          'Secclla'
        ]
      },
      {
        nombre: 'Castrovirreyna',
        distritos: [
          'Castrovirreyna',
          'Arma',
          'Aurahuá',
          'Capillas',
          'Chupamarca',
          'Cocas',
          'Huachos',
          'Huamatambo',
          'Mollepampa',
          'San Juan',
          'Santa Ana',
          'Tantara',
          'Ticrapo'
        ]
      },
      {
        nombre: 'Churcampa',
        distritos: [
          'Churcampa',
          'Anco',
          'Chinchihuasi',
          'Cosme',
          'El Carmen',
          'La Merced',
          'Locroja',
          'Pachamarca',
          'Paucarbamba',
          'San Miguel de Mayocc',
          'San Pedro de Coris'
        ]
      },
      {
        nombre: 'Huaytará',
        distritos: [
          'Huaytará',
          'Ayaví',
          'Córdova',
          'Huayacundo Arma',
          'Laramarca',
          'Ocoyo',
          'Pilpichaca',
          'Querco',
          'Quito-Arma',
          'San Antonio de Cusicancha',
          'San Francisco de Sangayaico',
          'San Isidro',
          'Santiago de Chocorvos',
          'Santiago de Quirahuara',
          'Santo Domingo de Capillas',
          'Tambo'
        ]
      },
      {
        nombre: 'Tayacaja',
        distritos: [
          'Pampas',
          'Acostambo',
          'Acraquia',
          'Ahuaycha',
          'Andaymarca',
          'Colcabamba',
          'Daniel Hernández',
          'Huachocolpa',
          'Huaribamba',
          'Ñahuimpuquio',
          'Pazos',
          'Pichos',
          'Quichuas',
          'Quishuar',
          'Roble',
          'Salcabamba',
          'Salcahuasi',
          'San Marcos de Rocchac',
          'Santiago de Tucuma',
          'Surcubamba',
          'Tintay Puncu'
        ]
      }
    ]
  },
  {
    nombre: 'Huánuco',
    provincias: [
      {
        nombre: 'Huánuco',
        distritos: [
          'Huánuco',
          'Amarilis',
          'Chinchao',
          'Churubamba',
          'Margos',
          'Pillco Marca',
          'Quisqui',
          'San Francisco de Cayrán',
          'San Pablo de Pillao',
          'San Pedro de Chaulán',
          'Santa María del Valle',
          'Yacus',
          'Yarumayo'
        ]
      },
      {
        nombre: 'Ambo',
        distritos: ['Ambo', 'Cayna', 'Colpas', 'Conchamarca', 'Huácar', 'San Francisco', 'San Rafael', 'Tomay Kichwa']
      },
      {
        nombre: 'Dos de Mayo',
        distritos: ['La Unión', 'Chuquis', 'Marías', 'Pachas', 'Quivilla', 'Ripán', 'Shunqui', 'Sillapata', 'Yanas']
      },
      { nombre: 'Huacaybamba', distritos: ['Huacaybamba', 'Canchabamba', 'Cochabamba', 'Pinra'] },
      {
        nombre: 'Huamalíes',
        distritos: [
          'Llata',
          'Arancay',
          'Chavín de Pariarca',
          'Jacas Grande',
          'Jircan',
          'Miraflores',
          'Monzón',
          'Punchao',
          'Puños',
          'Singa',
          'Tantamayo'
        ]
      },
      {
        nombre: 'Leoncio Prado',
        distritos: [
          'Rupa-Rupa (Tingo María)',
          'Castillo Grande',
          'Daniel Alomía Robles',
          'Hermílio Valdizán',
          'José Crespo y Castillo',
          'Luyando',
          'Mariano Dámaso Beraún',
          'Pucayacu',
          'Pueblo Nuevo',
          'Santo Domingo de Anda'
        ]
      },
      {
        nombre: 'Marañón',
        distritos: ['Huacrachuco', 'Cholón', 'La Morada', 'San Buenaventura', 'Santa Rosa de Alto Yanajanca']
      },
      { nombre: 'Pachitea', distritos: ['Panao', 'Chaglla', 'Molino', 'Umari'] },
      {
        nombre: 'Puerto Inca',
        distritos: ['Puerto Inca', 'Codo del Pozuzo', 'Honoria', 'Tournavista', 'Yuyapichis']
      },
      {
        nombre: 'Lauricocha',
        distritos: ['Jesús', 'Baños', 'Jivia', 'Queropalca', 'Rondos', 'San Francisco de Asís', 'San Miguel de Cauri']
      },
      {
        nombre: 'Yarowilca',
        distritos: ['Chavinillo', 'Aparicio Pomares', 'Cahuac', 'Chacabamba', 'Choras', 'Jacas Chico', 'Obas', 'Pampamarca']
      }
    ]
  },
  {
    nombre: 'Ica',
    provincias: [
      {
        nombre: 'Ica',
        distritos: [
          'Ica',
          'La Tinguiña',
          'Los Aquijes',
          'Ocucaje',
          'Pachacútec',
          'Parcona',
          'Pueblo Nuevo',
          'Salas',
          'San José de Los Molinos',
          'San Juan Bautista',
          'Santiago',
          'Subtanjalla',
          'Tate',
          'Yauca del Rosario'
        ]
      },
      {
        nombre: 'Chincha',
        distritos: [
          'Chincha Alta',
          'Alto Larán',
          'Chavín',
          'Chincha Baja',
          'El Carmen',
          'Grocio Prado',
          'Pueblo Nuevo',
          'San Juan de Yanac',
          'San Pedro de Huacarpana',
          'Sunampe',
          'Tambo de Mora'
        ]
      },
      {
        nombre: 'Nasca',
        distritos: ['Nasca', 'Changuillo', 'El Ingenio', 'Marcona', 'Vista Alegre']
      },
      { nombre: 'Palpa', distritos: ['Palpa', 'Llipata', 'Río Grande', 'Santa Cruz', 'Tibillo'] },
      {
        nombre: 'Pisco',
        distritos: [
          'Pisco',
          'Huancano',
          'Humay',
          'Independencia',
          'Paracas',
          'San Andrés',
          'San Clemente',
          'Túpac Amaru Inca'
        ]
      }
    ]
  },
  {
    nombre: 'Junín',
    provincias: [
      {
        nombre: 'Huancayo',
        distritos: [
          'Huancayo',
          'Carhuacallanga',
          'Chacapampa',
          'Chicche',
          'Chilca',
          'Chongos Alto',
          'Chupuro',
          'Colca',
          'Cullhuas',
          'El Tambo',
          'Huacrapuquio',
          'Hualhuas',
          'Huancán',
          'Huasicancha',
          'Huayucachi',
          'Ingenio',
          'Pariahuanca',
          'Pilcomayo',
          'Pucará',
          'Quichuay',
          'Quilcas',
          'San Agustín de Cajas',
          'San Jerónimo de Tunán',
          'Santo Domingo de Acobamba',
          'Saño',
          'Sapallanga',
          'Sicaya',
          'Viques'
        ]
      },
      {
        nombre: 'Concepción',
        distritos: [
          'Concepción',
          'Aco',
          'Andamarca',
          'Chambará',
          'Cochas',
          'Comas',
          'Heroínas Toledo',
          'Manzanares',
          'Mariscal Castilla',
          'Matahuasi',
          'Mito',
          'Nueve de Julio',
          'Orcotuna',
          'San José de Quero',
          'Santa Rosa de Ocopa'
        ]
      },
      {
        nombre: 'Chanchamayo',
        distritos: [
          'Chanchamayo (La Merced)',
          'Perené',
          'Pichanaqui',
          'San Luis de Shuaro',
          'San Ramón',
          'Vitoc'
        ]
      },
      {
        nombre: 'Jauja',
        distritos: [
          'Jauja',
          'Acolla',
          'Apata',
          'Ataura',
          'Canchayllo',
          'Curicaca',
          'El Mantaro',
          'Huamalí',
          'Huaripampa',
          'Huertas',
          'Janjaillo',
          'Julcán',
          'Leonor Ordóñez',
          'Llocllapampa',
          'Marco',
          'Masma',
          'Masma Chicche',
          'Molinos',
          'Monobamba',
          'Muqui',
          'Muquiyauyo',
          'Paca',
          'Paccha',
          'Pancán',
          'Parco',
          'Pomacancha',
          'Ricrán',
          'San Lorenzo',
          'San Pedro de Chunán',
          'Sausa',
          'Sincos',
          'Tunan Marca',
          'Yauli',
          'Yauyos'
        ]
      },
      {
        nombre: 'Junín',
        distritos: ['Junín', 'Carhuamayo', 'Ondores', 'Ulcumayo']
      },
      {
        nombre: 'Satipo',
        distritos: [
          'Satipo',
          'Coviriali',
          'Llaylla',
          'Mazamari',
          'Pampa Hermosa',
          'Pangoa',
          'Río Negro',
          'Río Tambo',
          'Vizcatán del Ene'
        ]
      },
      {
        nombre: 'Tarma',
        distritos: [
          'Tarma',
          'Acobamba',
          'Huaricolca',
          'Huasahuasi',
          'La Unión',
          'Palca',
          'Palcamayo',
          'San Pedro de Cajas',
          'Tapo'
        ]
      },
      {
        nombre: 'Yauli',
        distritos: [
          'La Oroya',
          'Chacapalpa',
          'Huay-Huay',
          'Marcapomacocha',
          'Morococha',
          'Paccha',
          'Santa Bárbara de Carhuacayán',
          'Santa Rosa de Sacco',
          'Suitucancha',
          'Yauli'
        ]
      },
      {
        nombre: 'Chupaca',
        distritos: [
          'Chupaca',
          'Áhuac',
          'Chongos Bajo',
          'Huachac',
          'Huamancaca Chico',
          'San Juan de Iscos',
          'San Juan de Jarpa',
          'Tres de Diciembre',
          'Yanacancha'
        ]
      }
    ]
  },
  {
    nombre: 'La Libertad',
    provincias: [
      {
        nombre: 'Trujillo',
        distritos: [
          'Trujillo',
          'El Porvenir',
          'Florencia de Mora',
          'Huanchaco',
          'La Esperanza',
          'Laredo',
          'Moche',
          'Poroto',
          'Salaverry',
          'Simbal',
          'Víctor Larco Herrera'
        ]
      },
      {
        nombre: 'Ascope',
        distritos: [
          'Ascope',
          'Casa Grande',
          'Chicama',
          'Chocope',
          'Magdalena de Cao',
          'Paiján',
          'Rázuri',
          'Santiago de Cao'
        ]
      },
      {
        nombre: 'Bolívar',
        distritos: ['Bolívar', 'Bambamarca', 'Condormarca', 'Longotea', 'Uchumarca', 'Ucuncha']
      },
      {
        nombre: 'Chepén',
        distritos: ['Chepén', 'Pacanga', 'Pueblo Nuevo']
      },
      {
        nombre: 'Julcán',
        distritos: ['Julcán', 'Calamarca', 'Carabamba', 'Huaso']
      },
      {
        nombre: 'Otuzco',
        distritos: [
          'Otuzco',
          'Agallpampa',
          'Charat',
          'Huaranchal',
          'La Cuesta',
          'Mache',
          'Paranday',
          'Salpo',
          'Sinsicap',
          'Usquil'
        ]
      },
      {
        nombre: 'Pacasmayo',
        distritos: ['San Pedro de Lloc', 'Guadalupe', 'Jequetepeque', 'Pacasmayo', 'San José']
      },
      {
        nombre: 'Pataz',
        distritos: [
          'Tayabamba',
          'Buldibuyo',
          'Chillia',
          'Huancaspata',
          'Huaylillas',
          'Huayo',
          'Ongón',
          'Parcoy',
          'Pataz',
          'Pías',
          'Santiago de Challas',
          'Taurija',
          'Urpay'
        ]
      },
      {
        nombre: 'Sánchez Carrión',
        distritos: [
          'Huamachuco',
          'Chugay',
          'Cochorco',
          'Curgos',
          'Marcabal',
          'Sanagorán',
          'Sarin',
          'Sartimbamba'
        ]
      },
      {
        nombre: 'Santiago de Chuco',
        distritos: [
          'Santiago de Chuco',
          'Angasmarca',
          'Cachicadán',
          'Mollebamba',
          'Mollepata',
          'Quiruvilca',
          'Santa Cruz de Chuca',
          'Sitabamba'
        ]
      },
      {
        nombre: 'Gran Chimú',
        distritos: ['Cascas', 'Lucma', 'Marmot', 'Sayapullo']
      },
      {
        nombre: 'Virú',
        distritos: ['Virú', 'Chao', 'Guadalupito']
      }
    ]
  },
  {
    nombre: 'Lambayeque',
    provincias: [
      {
        nombre: 'Chiclayo',
        distritos: [
          'Chiclayo',
          'Cayaltí',
          'Chongoyape',
          'Eten',
          'Eten Puerto',
          'José Leonardo Ortiz',
          'La Victoria',
          'Lagunas',
          'Monsefú',
          'Nueva Arica',
          'Oyotún',
          'Pátapo',
          'Picsi',
          'Pimentel',
          'Pomalca',
          'Pucalá',
          'Reque',
          'Santa Rosa',
          'Saña',
          'Tumán'
        ]
      },
      {
        nombre: 'Ferreñafe',
        distritos: [
          'Ferreñafe',
          'Cañaris',
          'Incahuasi',
          'Manuel Antonio Mesones Muro',
          'Pítipo',
          'Pueblo Nuevo'
        ]
      },
      {
        nombre: 'Lambayeque',
        distritos: [
          'Lambayeque',
          'Chóchope',
          'Íllimo',
          'Jayanca',
          'Mochumí',
          'Mórrope',
          'Motupe',
          'Olmos',
          'Pacora',
          'Salas',
          'San José',
          'Túcume'
        ]
      }
    ]
  },
  {
    nombre: 'Lima',
    provincias: [
      {
        nombre: 'Lima',
        distritos: [
          'Lima (Cercado)',
          'Ancón',
          'Ate',
          'Barranco',
          'Breña',
          'Carabayllo',
          'Chaclacayo',
          'Chorrillos',
          'Cieneguilla',
          'Comas',
          'El Agustino',
          'Independencia',
          'Jesús María',
          'La Molina',
          'La Victoria',
          'Lince',
          'Los Olivos',
          'Lurigancho (Chosica)',
          'Lurín',
          'Magdalena del Mar',
          'Miraflores',
          'Pachacámac',
          'Pucusana',
          'Pueblo Libre',
          'Puente Piedra',
          'Punta Hermosa',
          'Punta Negra',
          'Rímac',
          'San Bartolo',
          'San Borja',
          'San Isidro',
          'San Juan de Lurigancho',
          'San Juan de Miraflores',
          'San Luis',
          'San Martín de Porres',
          'San Miguel',
          'Santa Anita',
          'Santa María del Mar',
          'Santa Rosa',
          'Santiago de Surco',
          'Surquillo',
          'Villa El Salvador',
          'Villa María del Triunfo'
        ]
      },
      {
        nombre: 'Barranca',
        distritos: ['Barranca', 'Paramonga', 'Pativilca', 'Supe', 'Supe Puerto']
      },
      {
        nombre: 'Cajatambo',
        distritos: ['Cajatambo', 'Copa', 'Gorgor', 'Huancapón', 'Manás']
      },
      {
        nombre: 'Canta',
        distritos: ['Canta', 'Arahuay', 'Huamantanga', 'Huaros', 'Lachaqui', 'San Buenaventura', 'Santa Rosa de Quives']
      },
      {
        nombre: 'Cañete',
        distritos: [
          'San Vicente de Cañete',
          'Asia',
          'Calango',
          'Cerro Azul',
          'Chilca',
          'Coayllo',
          'Imperial',
          'Lunahuaná',
          'Mala',
          'Nuevo Imperial',
          'Pacarán',
          'Quilmaná',
          'San Antonio',
          'San Luis',
          'Santa Cruz de Flores',
          'Zúñiga'
        ]
      },
      {
        nombre: 'Huaral',
        distritos: [
          'Huaral',
          'Atavillos Alto',
          'Atavillos Bajo',
          'Aucallama',
          'Chancay',
          'Ihuarí',
          'Lampián',
          'Pacaraos',
          'San Miguel de Acos',
          'Santa Cruz de Andamarca',
          'Sumbilca',
          'Veintisiete de Noviembre'
        ]
      },
      {
        nombre: 'Huarochirí',
        distritos: [
          'Matucana',
          'Antioquía',
          'Callahuanca',
          'Carampoma',
          'Chicla',
          'Cuenca',
          'Huachupampa',
          'Huanza',
          'Huarochirí',
          'Lahuaytambo',
          'Langa',
          'Laraos',
          'Mariatana',
          'Ricardo Palma',
          'San Andrés de Tupicocha',
          'San Antonio',
          'San Bartolomé',
          'San Damián',
          'San Juan de Iris',
          'San Juan de Tantaranche',
          'San Lorenzo de Quinti',
          'San Mateo',
          'San Mateo de Otao',
          'San Pedro de Casta',
          'San Pedro de Huancayre',
          'Sangallaya',
          'Santa Cruz de Cocachacra',
          'Santa Eulalia',
          'Santiago de Anchucaya',
          'Santiago de Tuna',
          'Santo Domingo de los Olleros',
          'Surco'
        ]
      },
      {
        nombre: 'Huaura',
        distritos: [
          'Huacho',
          'Ámbar',
          'Caleta de Carquín',
          'Checras',
          'Hualmay',
          'Huaura',
          'Leoncio Prado',
          'Paccho',
          'Santa Leonor',
          'Santa María',
          'Sayán',
          'Végueta'
        ]
      },
      {
        nombre: 'Oyón',
        distritos: ['Oyón', 'Andajes', 'Caujul', 'Cochamarca', 'Naván', 'Pachangara']
      },
      {
        nombre: 'Yauyos',
        distritos: [
          'Yauyos',
          'Alis',
          'Ayauca',
          'Ayavirí',
          'Azángaro',
          'Cacra',
          'Carania',
          'Catahuasi',
          'Chocos',
          'Cochas',
          'Colonia',
          'Hongos',
          'Huampara',
          'Huancaya',
          'Huangáscar',
          'Huantán',
          'Huañec',
          'Laraos',
          'Lincha',
          'Madeán',
          'Miraflores',
          'Omas',
          'Putinza',
          'Quinches',
          'Quinocay',
          'San Joaquín',
          'San Pedro de Pilas',
          'Tanta',
          'Tauripampa',
          'Tomas',
          'Tupe',
          'Viñac',
          'Vitis'
        ]
      }
    ]
  },
  {
    nombre: 'Loreto',
    provincias: [
      {
        nombre: 'Maynas',
        distritos: [
          'Iquitos',
          'Alto Nanay',
          'Belén',
          'Fernando Lores',
          'Indiana',
          'Las Amazonas',
          'Mazán',
          'Napo',
          'Punchana',
          'San Juan Bautista',
          'Torres Causana'
        ]
      },
      {
        nombre: 'Alto Amazonas',
        distritos: ['Yurimaguas', 'Balsapuerto', 'Jeberos', 'Lagunas', 'Santa Cruz', 'Teniente César López Rojas']
      },
      {
        nombre: 'Loreto',
        distritos: ['Nauta', 'Parinari', 'Tigre', 'Trompeteros', 'Urarinas']
      },
      {
        nombre: 'Mariscal Ramón Castilla',
        distritos: ['Ramón Castilla (Caballococha)', 'Pebas', 'San Pablo', 'Yavarí']
      },
      {
        nombre: 'Requena',
        distritos: [
          'Requena',
          'Alto Tapiche',
          'Capelo',
          'Emilio San Martín',
          'Jenaro Herrera',
          'Maquía',
          'Puinahua',
          'Saquena',
          'Soplín',
          'Tapiche',
          'Yaquerana'
        ]
      },
      {
        nombre: 'Ucayali',
        distritos: ['Contamana', 'Inahuaya', 'Padre Márquez', 'Pampa Hermosa', 'Sarayacu', 'Vargas Guerra']
      },
      {
        nombre: 'Datem del Marañón',
        distritos: ['Barranca', 'Andoas', 'Cahuapanas', 'Manseriche', 'Morona', 'Pastaza']
      },
      {
        nombre: 'Putumayo',
        distritos: ['Putumayo', 'Rosa Panduro', 'Teniente Manuel Clavero', 'Yaguas']
      }
    ]
  },
  {
    nombre: 'Madre de Dios',
    provincias: [
      {
        nombre: 'Tambopata',
        distritos: ['Tambopata (Puerto Maldonado)', 'Inambari', 'Laberinto', 'Las Piedras']
      },
      {
        nombre: 'Manu',
        distritos: ['Manu', 'Fitzcarrald', 'Huepetuhe', 'Madre de Dios']
      },
      {
        nombre: 'Tahuamanu',
        distritos: ['Iñapari', 'Iberia', 'Tahuamanu']
      }
    ]
  },
  {
    nombre: 'Moquegua',
    provincias: [
      {
        nombre: 'Mariscal Nieto',
        distritos: ['Moquegua', 'Carumas', 'Cuchumbaya', 'Samegua', 'San Antonio', 'San Cristóbal', 'Torata']
      },
      {
        nombre: 'General Sánchez Cerro',
        distritos: [
          'Omate',
          'Chojata',
          'Coalaque',
          'Ichuña',
          'La Capilla',
          'Lloque',
          'Matalaque',
          'Puquina',
          'Quinistaquillas',
          'Ubinas',
          'Yunga'
        ]
      },
      { nombre: 'Ilo', distritos: ['Ilo', 'El Algarrobal', 'Pacocha'] }
    ]
  },
  {
    nombre: 'Pasco',
    provincias: [
      {
        nombre: 'Pasco',
        distritos: [
          'Chaupimarca (Cerro de Pasco)',
          'Huachón',
          'Huariaca',
          'Huayllay',
          'Ninacaca',
          'Pallanchacra',
          'Paucartambo',
          'San Francisco de Asís de Yarusyacán',
          'Simón Bolívar',
          'Ticlacayán',
          'Tinyahuarco',
          'Vicco',
          'Yanacancha'
        ]
      },
      {
        nombre: 'Daniel Alcides Carrión',
        distritos: [
          'Yanahuanca',
          'Chacayán',
          'Goyllarisquizga',
          'Páucar',
          'San Pedro de Pillao',
          'Santa Ana de Tusi',
          'Tapuc',
          'Vilcabamba'
        ]
      },
      {
        nombre: 'Oxapampa',
        distritos: [
          'Oxapampa',
          'Chontabamba',
          'Constitución',
          'Huancabamba',
          'Palcazú',
          'Pozuzo',
          'Puerto Bermúdez',
          'Villa Rica'
        ]
      }
    ]
  },
  {
    nombre: 'Piura',
    provincias: [
      {
        nombre: 'Piura',
        distritos: [
          'Piura',
          'Castilla',
          'Catacaos',
          'Cura Mori',
          'El Tallán',
          'La Arena',
          'La Unión',
          'Las Lomas',
          'Tambo Grande',
          'Veintiséis de Octubre'
        ]
      },
      {
        nombre: 'Ayabaca',
        distritos: [
          'Ayabaca',
          'Frías',
          'Jililí',
          'Lagunas',
          'Montero',
          'Pacaipampa',
          'Paimas',
          'Sapillica',
          'Sicchez',
          'Suyo'
        ]
      },
      {
        nombre: 'Huancabamba',
        distritos: [
          'Huancabamba',
          'Canchaque',
          'El Carmen de la Frontera',
          'Huarmaca',
          'Lalaquiz',
          'San Miguel de El Faique',
          'Sóndor',
          'Sondorillo'
        ]
      },
      {
        nombre: 'Morropón',
        distritos: [
          'Chulucanas',
          'Buenos Aires',
          'Chalaco',
          'La Matanza',
          'Morropón',
          'Salitral',
          'San Juan de Bigote',
          'Santa Catalina de Mossa',
          'Santo Domingo',
          'Yamango'
        ]
      },
      {
        nombre: 'Paita',
        distritos: ['Paita', 'Amotape', 'Arenal', 'Colán', 'La Huaca', 'Tamarindo', 'Vichayal']
      },
      {
        nombre: 'Sullana',
        distritos: [
          'Sullana',
          'Bellavista',
          'Ignacio Escudero',
          'Lancones',
          'Marcavelica',
          'Miguel Checa',
          'Querecotillo',
          'Salitral'
        ]
      },
      {
        nombre: 'Talara',
        distritos: ['Pariñas (Talara)', 'El Alto', 'La Brea', 'Lobitos', 'Los Órganos', 'Máncora']
      },
      {
        nombre: 'Sechura',
        distritos: ['Sechura', 'Bellavista de la Unión', 'Bernal', 'Cristo Nos Valga', 'Rinconada Llicuar', 'Vice']
      }
    ]
  },
  {
    nombre: 'Puno',
    provincias: [
      {
        nombre: 'Puno',
        distritos: [
          'Puno',
          'Ácora',
          'Amantaní',
          'Atuncolla',
          'Capachica',
          'Chucuito',
          'Coata',
          'Huata',
          'Mañazo',
          'Paucarcolla',
          'Pichacani',
          'Platería',
          'San Antonio',
          'Tiquillaca',
          'Vilque'
        ]
      },
      {
        nombre: 'Azángaro',
        distritos: [
          'Azángaro',
          'Achaya',
          'Arapa',
          'Asillo',
          'Caminaca',
          'Chupa',
          'José Domingo Choquehuanca',
          'Muñani',
          'Potoni',
          'Samán',
          'San Antón',
          'San José',
          'San Juan de Salinas',
          'Santiago de Pupuja',
          'Tirapata'
        ]
      },
      {
        nombre: 'Carabaya',
        distritos: [
          'Macusani',
          'Ajoyani',
          'Ayapata',
          'Coasa',
          'Corani',
          'Crucero',
          'Ituata',
          'Ollachea',
          'San Gabán',
          'Usicayos'
        ]
      },
      {
        nombre: 'Chucuito',
        distritos: ['Juli', 'Desaguadero', 'Huacullani', 'Kelluyo', 'Pisacoma', 'Pomata', 'Zepita']
      },
      {
        nombre: 'El Collao',
        distritos: ['Ilave', 'Capazo', 'Conduriri', 'Pilcuyo', 'Santa Rosa']
      },
      {
        nombre: 'Huancané',
        distritos: [
          'Huancané',
          'Cojata',
          'Huatasani',
          'Inchupalla',
          'Pusi',
          'Rosaspata',
          'Taraco',
          'Vilque Chico'
        ]
      },
      {
        nombre: 'Lampa',
        distritos: [
          'Lampa',
          'Cabanilla',
          'Calapuja',
          'Nicasio',
          'Ocuviri',
          'Palca',
          'Paratía',
          'Pucará',
          'Santa Lucía',
          'Vilavila'
        ]
      },
      {
        nombre: 'Melgar',
        distritos: ['Ayaviri', 'Antauta', 'Cupi', 'Llalli', 'Macari', 'Nuñoa', 'Orurillo', 'Santa Rosa', 'Umachiri']
      },
      { nombre: 'Moho', distritos: ['Moho', 'Conima', 'Huayrapata', 'Tilali'] },
      {
        nombre: 'San Antonio de Putina',
        distritos: ['Putina', 'Ananea', 'Pedro Vilca Apaza', 'Quilcapuncu', 'Sina']
      },
      {
        nombre: 'San Román',
        distritos: ['Juliaca', 'Cabana', 'Cabanillas', 'Caracoto', 'San Miguel']
      },
      {
        nombre: 'Sandia',
        distritos: [
          'Sandia',
          'Alto Inambari',
          'Cuyocuyo',
          'Limbani',
          'Patambuco',
          'Phara',
          'Quiaca',
          'San Juan del Oro',
          'San Pedro de Putina Punco',
          'Yanahuaya'
        ]
      },
      {
        nombre: 'Yunguyo',
        distritos: ['Yunguyo', 'Anapia', 'Copani', 'Cuturapi', 'Ollaraya', 'Tinicachi', 'Unicachi']
      }
    ]
  },
  {
    nombre: 'San Martín',
    provincias: [
      {
        nombre: 'Moyobamba',
        distritos: ['Moyobamba', 'Calzada', 'Habana', 'Jepelacio', 'Soritor', 'Yantaló']
      },
      {
        nombre: 'Bellavista',
        distritos: ['Bellavista', 'Alto Biavo', 'Bajo Biavo', 'Huallaga', 'San Pablo', 'San Rafael']
      },
      {
        nombre: 'El Dorado',
        distritos: ['San José de Sisa', 'Agua Blanca', 'San Martín', 'Santa Rosa', 'Shatoja']
      },
      {
        nombre: 'Huallaga',
        distritos: ['Saposoa', 'Alto Saposoa', 'El Eslabón', 'Piscoyacu', 'Sacanche', 'Tingo de Saposoa']
      },
      {
        nombre: 'Lamas',
        distritos: [
          'Lamas',
          'Alonso de Alvarado',
          'Barranquita',
          'Caynarachi',
          'Cuñumbuqui',
          'Pinto Recodo',
          'Rumisapa',
          'San Roque de Cumbaza',
          'Shanao',
          'Tabalosos',
          'Zapatero'
        ]
      },
      {
        nombre: 'Mariscal Cáceres',
        distritos: ['Juanjuí', 'Campanilla', 'Huicungo', 'Pachiza', 'Pajarillo']
      },
      {
        nombre: 'Picota',
        distritos: [
          'Picota',
          'Buenos Aires',
          'Caspisapa',
          'Pilluana',
          'Pucacaca',
          'San Cristóbal',
          'San Hilarión',
          'Shamboyacu',
          'Tingo de Ponasa',
          'Tres Unidos'
        ]
      },
      {
        nombre: 'Rioja',
        distritos: [
          'Rioja',
          'Awajún',
          'Elías Soplín Vargas',
          'Nueva Cajamarca',
          'Pardo Miguel',
          'Posic',
          'San Fernando',
          'Yorongos',
          'Yuracyacu'
        ]
      },
      {
        nombre: 'San Martín',
        distritos: [
          'Tarapoto',
          'Alberto Leveau',
          'Cacatachi',
          'Chazuta',
          'Chipurana',
          'El Porvenir',
          'Huimbayoc',
          'Juan Guerra',
          'La Banda de Shilcayo',
          'Morales',
          'Papaplaya',
          'San Antonio',
          'Sauce',
          'Shapaja'
        ]
      },
      {
        nombre: 'Tocache',
        distritos: ['Tocache', 'Nuevo Progreso', 'Pólvora', 'Santa Lucía', 'Shunté', 'Uchiza']
      }
    ]
  },
  {
    nombre: 'Tacna',
    provincias: [
      {
        nombre: 'Tacna',
        distritos: [
          'Tacna',
          'Alto de la Alianza',
          'Calana',
          'Ciudad Nueva',
          'Coronel Gregorio Albarracín Lanchipa',
          'Inclán',
          'La Yarada-Los Palos',
          'Pachía',
          'Palca',
          'Pocollay',
          'Sama'
        ]
      },
      {
        nombre: 'Candarave',
        distritos: ['Candarave', 'Cairani', 'Camilaca', 'Curibaya', 'Huanuara', 'Quilahuani']
      },
      {
        nombre: 'Jorge Basadre',
        distritos: ['Locumba', 'Ilabaya', 'Ite']
      },
      {
        nombre: 'Tarata',
        distritos: [
          'Tarata',
          'Estique',
          'Estique-Pampa',
          'Héroes Albarracín',
          'Sitajara',
          'Susapaya',
          'Tarucachi',
          'Ticaco'
        ]
      }
    ]
  },
  {
    nombre: 'Tumbes',
    provincias: [
      {
        nombre: 'Tumbes',
        distritos: [
          'Tumbes',
          'Corrales',
          'La Cruz',
          'Pampas de Hospital',
          'San Jacinto',
          'San Juan de la Virgen'
        ]
      },
      {
        nombre: 'Contralmirante Villar',
        distritos: ['Zorritos', 'Canoas de Punta Sal', 'Casitas']
      },
      {
        nombre: 'Zarumilla',
        distritos: ['Zarumilla', 'Aguas Verdes', 'Matapalo', 'Papayal']
      }
    ]
  },
  {
    nombre: 'Ucayali',
    provincias: [
      {
        nombre: 'Coronel Portillo',
        distritos: [
          'Callería (Pucallpa)',
          'Campoverde',
          'Iparía',
          'Manantay',
          'Masisea',
          'Nueva Requena',
          'Yarinacocha'
        ]
      },
      {
        nombre: 'Atalaya',
        distritos: ['Raymondi (Atalaya)', 'Sepahua', 'Tahuanía', 'Yurúa']
      },
      {
        nombre: 'Padre Abad',
        distritos: ['Padre Abad (Aguaytía)', 'Alexander Von Humboldt', 'Boquerón', 'Curimaná', 'Irázola', 'Neshuya']
      },
      { nombre: 'Purús', distritos: ['Purús'] }
    ]
  }
];

export const REGIONES_PERU: string[] = PERU_UBIGEO.map(r => r.nombre);

export function getProvinciasByRegion(region: string): string[] {
  const found = PERU_UBIGEO.find(r => r.nombre.toLowerCase() === region.toLowerCase());
  return found ? found.provincias.map(p => p.nombre) : [];
}

export function getDistritosByProvincia(region: string, provincia: string): string[] {
  const foundRegion = PERU_UBIGEO.find(r => r.nombre.toLowerCase() === region.toLowerCase());
  if (!foundRegion) return [];
  const foundProv = foundRegion.provincias.find(
    p => p.nombre.toLowerCase() === provincia.toLowerCase()
  );
  return foundProv ? foundProv.distritos : [];
}

const LEGACY_CITY_MAP: Record<string, { region: string; provincia: string; distrito: string }> = {
  'lima metropolitana': { region: 'Lima', provincia: 'Lima', distrito: 'Miraflores' },
  'callao': { region: 'Callao', provincia: 'Callao', distrito: 'Callao' },
  'arequipa': { region: 'Arequipa', provincia: 'Arequipa', distrito: 'Arequipa' },
  'cusco': { region: 'Cusco', provincia: 'Cusco', distrito: 'Cusco' },
  'trujillo (la libertad)': { region: 'La Libertad', provincia: 'Trujillo', distrito: 'Trujillo' },
  'chiclayo (lambayeque)': { region: 'Lambayeque', provincia: 'Chiclayo', distrito: 'Chiclayo' },
  'piura': { region: 'Piura', provincia: 'Piura', distrito: 'Piura' },
  'huancayo (junín)': { region: 'Junín', provincia: 'Huancayo', distrito: 'Huancayo' },
  'ayacucho': { region: 'Ayacucho', provincia: 'Huamanga', distrito: 'Ayacucho' },
  'iquitos (loreto)': { region: 'Loreto', provincia: 'Maynas', distrito: 'Iquitos' },
  'tacna': { region: 'Tacna', provincia: 'Tacna', distrito: 'Tacna' },
  'cajamarca': { region: 'Cajamarca', provincia: 'Cajamarca', distrito: 'Cajamarca' },
  'puno': { region: 'Puno', provincia: 'Puno', distrito: 'Puno' },
  'ica': { region: 'Ica', provincia: 'Ica', distrito: 'Ica' },
  'chimbote (áncash)': { region: 'Áncash', provincia: 'Santa', distrito: 'Chimbote' },
  'huánuco': { region: 'Huánuco', provincia: 'Huánuco', distrito: 'Huánuco' }
};

export function inferUbicacionPeru(
  distrito?: string,
  provincia?: string,
  region?: string
): { region: string; provincia: string; distrito: string } {
  if (region && provincia && distrito) {
    return { region, provincia, distrito };
  }

  const raw = (distrito || '').trim();
  const lower = raw.toLowerCase();

  if (lower && LEGACY_CITY_MAP[lower]) {
    const mapped = LEGACY_CITY_MAP[lower];
    return {
      region: region || mapped.region,
      provincia: provincia || mapped.provincia,
      distrito: mapped.distrito
    };
  }

  if (raw) {
    for (const r of PERU_UBIGEO) {
      if (region && r.nombre.toLowerCase() !== region.toLowerCase()) continue;
      for (const p of r.provincias) {
        if (provincia && p.nombre.toLowerCase() !== provincia.toLowerCase()) continue;
        const matchDist = p.distritos.find(d => d.toLowerCase() === lower);
        if (matchDist) {
          return { region: r.nombre, provincia: p.nombre, distrito: matchDist };
        }
      }
    }
    // Check partial or province name match
    for (const r of PERU_UBIGEO) {
      for (const p of r.provincias) {
        if (p.nombre.toLowerCase() === lower) {
          return { region: r.nombre, provincia: p.nombre, distrito: p.distritos[0] || p.nombre };
        }
      }
      if (r.nombre.toLowerCase() === lower) {
        const firstProv = r.provincias[0];
        return {
          region: r.nombre,
          provincia: firstProv.nombre,
          distrito: firstProv.distritos[0] || firstProv.nombre
        };
      }
    }
  }

  if (region) {
    const foundRegion = PERU_UBIGEO.find(r => r.nombre.toLowerCase() === region.toLowerCase());
    if (foundRegion) {
      const provObj =
        foundRegion.provincias.find(p => p.nombre.toLowerCase() === (provincia || '').toLowerCase()) ||
        foundRegion.provincias[0];
      return {
        region: foundRegion.nombre,
        provincia: provObj.nombre,
        distrito: raw || provObj.distritos[0] || provObj.nombre
      };
    }
  }

  return {
    region: region || 'Lima',
    provincia: provincia || 'Lima',
    distrito: raw || 'Miraflores'
  };
}

export function formatUbicacion(distrito?: string, provincia?: string, region?: string): string {
  const resolved = inferUbicacionPeru(distrito, provincia, region);
  if (resolved.distrito === resolved.provincia && resolved.provincia === resolved.region) {
    return `${resolved.distrito}, Perú`;
  }
  if (resolved.distrito === resolved.provincia) {
    return `${resolved.distrito}, ${resolved.region}`;
  }
  if (resolved.provincia === resolved.region) {
    return `${resolved.distrito}, ${resolved.region}`;
  }
  return `${resolved.distrito}, ${resolved.provincia} · ${resolved.region}`;
}

export const TOTAL_REGIONES_PERU = PERU_UBIGEO.length;
export const TOTAL_PROVINCIAS_PERU = PERU_UBIGEO.reduce((acc, r) => acc + r.provincias.length, 0);
export const TOTAL_DISTRITOS_PERU = PERU_UBIGEO.reduce(
  (acc, r) => acc + r.provincias.reduce((pAcc, p) => pAcc + p.distritos.length, 0),
  0
);
