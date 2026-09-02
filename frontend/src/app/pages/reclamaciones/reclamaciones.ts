import { Component, OnInit, inject, ChangeDetectorRef, NgZone } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { timeout } from 'rxjs';
import { environment } from '../../../environments/environment';

const PERU_DATA: Record<string, { provincias: string[]; distritos: Record<string, string[]> }> = {
  'Cusco': {
    provincias: ['Cusco', 'Acomayo', 'Anta', 'Calca', 'Canas', 'Canchis', 'Chumbivilcas', 'Espinar', 'Paruro', 'Paucartambo', 'Quispicanchi', 'Urubamba'],
    distritos: {
      'Cusco': ['Cusco', 'Ccorca', 'Poroy', 'San Jerónimo', 'San Sebastián', 'Santiago', 'Saylla', 'Wanchaq'],
      'Acomayo': ['Acomayo', 'Acopia', 'Acos', 'Mosoc Llacta', 'Pomacanchi', 'Rondocan', 'Sangarará'],
      'Anta': ['Anta', 'Ancahuasi', 'Cachimayo', 'Chinchaypujio', 'Huarocondo', 'Limatambo', 'Mollepata', 'Pucyura', 'Zurite'],
      'Calca': ['Calca', 'Coya', 'Lamay', 'Lares', 'Pisac', 'San Salvador', 'Taray', 'Yanatile'],
      'Canas': ['Yanaoca', 'Checca', 'Kunturkanki', 'Langui', 'Layo', 'Pampamarca', 'Quehue', 'Tupac Amaru'],
      'Canchis': ['Sicuani', 'Checacupe', 'Combapata', 'Maranganí', 'Pitumarca', 'San Pablo', 'San Pedro', 'Tinta'],
      'Chumbivilcas': ['Santo Tomás', 'Capacmarca', 'Chamaca', 'Colquemarca', 'Livitaca', 'Llusco', 'Quiñota', 'Velille'],
      'Espinar': ['Yauri', 'Alto Pichigua', 'Coporaque', 'Espinar', 'Ocoruro', 'Pallpata', 'Pichigua', 'Suyckutambo'],
      'Paruro': ['Paruro', 'Accha', 'Ccapi', 'Colcha', 'Huanoquite', 'Omacha', 'Paccaritambo', 'Pillpinto', 'Yaurisque'],
      'Paucartambo': ['Paucartambo', 'Caicay', 'Challabamba', 'Colquepata', 'Huancarani', 'Kosñipata'],
      'Quispicanchi': ['Urcos', 'Andahuaylillas', 'Camanti', 'Ccarhuayo', 'Ccatca', 'Cusipata', 'Huaro', 'Lucre', 'Marcapata', 'Ocongate', 'Oropesa', 'Quiquijana'],
      'Urubamba': ['Urubamba', 'Chinchero', 'Huayllabamba', 'Machu Picchu', 'Ollantaytambo', 'Yucay'],
    }
  },
  'Lima': {
    provincias: ['Lima', 'Barranca', 'Cajatambo', 'Cañete', 'Huaral', 'Huarochirí', 'Huaura', 'Oyón', 'Yauyos'],
    distritos: {
      'Lima': ['Lima', 'Ate', 'Barranco', 'Breña', 'Carabayllo', 'Chaclacayo', 'Chorrillos', 'Comas', 'El Agustino', 'Independencia', 'Jesús María', 'La Molina', 'La Victoria', 'Lince', 'Los Olivos', 'Lurín', 'Magdalena del Mar', 'Miraflores', 'Puente Piedra', 'Rímac', 'San Borja', 'San Isidro', 'San Juan de Lurigancho', 'San Juan de Miraflores', 'San Luis', 'San Martín de Porres', 'San Miguel', 'Santa Anita', 'Santiago de Surco', 'Surquillo', 'Villa El Salvador', 'Villa María del Triunfo'],
      'Barranca': ['Barranca', 'Paramonga', 'Pativilca', 'Supe', 'Supe Puerto'],
      'Cajatambo': ['Cajatambo', 'Copa', 'Gorgor', 'Huancapón', 'Manas'],
      'Cañete': ['San Vicente de Cañete', 'Asia', 'Calango', 'Cerro Azul', 'Chilca', 'Coayllo', 'Imperial', 'Lunahuaná', 'Mala', 'Nuevo Imperial', 'Omas', 'Pacarán', 'Quilmaná', 'San Antonio', 'San Luis', 'Santa Cruz de Flores', 'Zúñiga'],
      'Huaral': ['Huaral', 'Atavillos Alto', 'Atavillos Bajo', 'Aucallama', 'Chancay', 'Ihuarí', 'Lampián', 'Pacaraos', 'San Miguel de Acos', 'Santa Cruz de Andamarca', 'Sumbilca', 'Veintisiete de Noviembre'],
      'Huarochirí': ['Matucana', 'Antioquía', 'Callahuanca', 'Carampoma', 'Chicla', 'Cuenca', 'Huachupampa', 'Huanza', 'Huarochirí', 'Lahuaytambo', 'Langa', 'Laraos', 'Mariatana', 'Ricardo Palma', 'San Andrés de Tupicocha', 'San Antonio', 'San Damián', 'San Juan de Iris', 'San Lorenzo de Quinti', 'San Mateo', 'San Mateo de Otao', 'San Pedro de Casta', 'San Pedro de Huancayre', 'Sangallaya', 'Santa Cruz de Cocachacra', 'Santa Eulalia', 'Santiago de Anchucaya', 'Santiago de Tuna', 'Santo Domingo de Los Olleros', 'Surco'],
      'Huaura': ['Huacho', 'Ambar', 'Caleta de Carquín', 'Checras', 'Hualmay', 'Huaura', 'Leoncio Prado', 'Paccho', 'Santa Leonor', 'Santa María', 'Sayán', 'Vegueta'],
      'Oyón': ['Oyón', 'Andajes', 'Caujul', 'Cochamarca', 'Naván', 'Pachangara'],
      'Yauyos': ['Yauyos', 'Alis', 'Allauca', 'Ayavirí', 'Azángaro', 'Cacra', 'Carania', 'Catahuasi', 'Chocos', 'Cochas', 'Colonia', 'Hongos', 'Huampará', 'Huancaya', 'Huangáscar', 'Huantán', 'Laraos', 'Lincha', 'Madean', 'Miraflores', 'Omas', 'Putinza', 'Quinches', 'San Joaquín', 'San Pedro de Pilas', 'Tanta', 'Tauripampa', 'Tomas', 'Tupe', 'Viñac', 'Vitis'],
    }
  },
  'Arequipa': { provincias: ['Arequipa', 'Camaná', 'Caravelí', 'Castilla', 'Caylloma', 'Condesuyos', 'Islay', 'La Unión'], distritos: {
    'Arequipa': ['Arequipa', 'Alto Selva Alegre', 'Cayma', 'Cerro Colorado', 'Characato', 'Chiguata', 'Jacobo Hunter', 'La Joya', 'Mariano Melgar', 'Miraflores', 'Mollebaya', 'Paucarpata', 'Pocsi', 'Polobaya', 'Quequeña', 'Sabandía', 'Sachaca', 'San Juan de Siguas', 'San Juan de Tarucani', 'Santa Isabel de Siguas', 'Santa Rita de Siguas', 'Socabaya', 'Tiabaya', 'Uchumayo', 'Vítor', 'Yanahuara', 'Yarabamba', 'Yura'],
    'Camaná': ['Camaná', 'José María Quimper', 'Mariano Nicolás Valcárcel', 'Mariscal Cáceres', 'Nicolás de Piérola', 'Ocoña', 'Quilca', 'Samuel Pastor'],
    'Caravelí': ['Caravelí', 'Acarí', 'Atico', 'Atiquipa', 'Bella Unión', 'Cahuacho', 'Chala', 'Chaparra', 'Huanuhuanu', 'Jaqui', 'Lomas', 'Quicacha', 'Yauca'],
    'Castilla': ['Aplao', 'Andagua', 'Ayo', 'Chachas', 'Chichas', 'Choco', 'Huancarqui', 'Machaguay', 'Orcopampa', 'Pampacolca', 'Puyca', 'Tipan', 'Uñon', 'Uraca', 'Viraco'],
    'Caylloma': ['Chivay', 'Achoma', 'Cabanaconde', 'Callalli', 'Caylloma', 'Coporaque', 'Huambo', 'Huanca', 'Ichupampa', 'Lari', 'Lluta', 'Maca', 'Madrigal', 'San Antonio de Chuca', 'Sibayo', 'Tapay', 'Tisco', 'Tuti', 'Yanque', 'Majes'],
    'Condesuyos': ['Chuquibamba', 'Andaray', 'Cayarani', 'Chichas', 'Iray', 'Rio Grande', 'Salamanca', 'Yanaquihua'],
    'Islay': ['Mollendo', 'Cocachacra', 'Dean Valdivia', 'Islay', 'Mejía', 'Punta de Bombón'],
    'La Unión': ['Cotahuasi', 'Alca', 'Charcana', 'Huaynacotas', 'Pampamarca', 'Puyca', 'Quechualla', 'Sayla', 'Tauria', 'Tomepampa', 'Toro'],
  } },
  'Ayacucho': { provincias: ['Huamanga', 'Cangallo', 'Huanca Sancos', 'Huanta', 'La Mar', 'Lucanas', 'Parinacochas', 'Páucar del Sara Sara', 'Sucre', 'Víctor Fajardo', 'Vilcas Huamán'], distritos: {
    'Huamanga': ['Ayacucho', 'Acocro', 'Acos Vinchos', 'Carmen Alto', 'Chiara', 'Jesús Nazareno', 'Ocros', 'Pacaycasa', 'Quinua', 'San José de Ticllas', 'San Juan Bautista', 'Santiago de Pischa', 'Socos', 'Tambillo', 'Vinchos'],
    'Cangallo': ['Cangallo', 'Chuschi', 'Los Morochucos', 'María Parado de Bellido', 'Paras', 'Totos'],
    'Huanca Sancos': ['Carapo', 'Sacsamarca', 'Sancos', 'Santiago de Lucanamarca'],
    'Huanta': ['Huanta', 'Ayahuanco', 'Iguaín', 'Llochegua', 'Luricocha', 'Pucacolpa', 'Santillana', 'Sivia', 'Uchuraccay'],
    'La Mar': ['San Miguel', 'Anco', 'Ayna', 'Chilcas', 'Chungui', 'Luis Carranza', 'Santa Rosa', 'Tambo'],
    'Lucanas': ['Puquio', 'Aucara', 'Cabana', 'Carmen Salcedo', 'Chaviña', 'Chipao', 'Huac-Huas', 'Laramate', 'Leoncio Prado', 'Llauta', 'Lucanas', 'Ocaña', 'Otoca', 'Saisa', 'San Cristóbal', 'San Juan', 'San Pedro', 'Sancos', 'Santa Lucia'],
    'Parinacochas': ['Coracora', 'Chumpi', 'Coronel Castañeda', 'Pacapausa', 'Puyusca', 'San Francisco de Rivacayco', 'Upahuacho'],
    'Páucar del Sara Sara': ['Pausa', 'Colta', 'Corculla', 'Lampa', 'Marcabamba', 'Oyolo', 'Pararca', 'Sara Sara'],
    'Sucre': ['Querobamba', 'Belén', 'Chalcos', 'Chilcayoc', 'Huacaña', 'Morcolla', 'Paico', 'San Pedro de Larcay', 'Santiago de Paucaray', 'Soras'],
    'Víctor Fajardo': ['Huancapi', 'Alcamenca', 'Apongo', 'Asquipata', 'Canaria', 'Cayara', 'Colca', 'Huamanquiquia', 'Huancaraylla', 'Huaya', 'Sarhua', 'Vilcanchos'],
    'Vilcas Huamán': ['Vilcas Huamán', 'Accomarca', 'Carhuanca', 'Concepción', 'Huambalpa', 'Independencia', 'Saurama', 'Vischongo'],
  } },
  'Apurímac': { provincias: ['Abancay', 'Andahuaylas', 'Antabamba', 'Aymaraes', 'Cotabambas', 'Chincheros', 'Grau'], distritos: {
    'Abancay': ['Abancay', 'Chacoche', 'Circa', 'Curahuasi', 'Huanipaca', 'Lambrama', 'Pichirhua', 'San Pedro de Cachora', 'Tamburco'],
    'Andahuaylas': ['Andahuaylas', 'Andarapa', 'Chiara', 'Huancarama', 'Huancaray', 'Huayana', 'Kaquiabamba', 'Kishuara', 'Pacobamba', 'Pacucha', 'Pampachiri', 'Pomacocha', 'San Antonio de Cachi', 'Santa María de Chicmo', 'Talavera', 'Turpo'],
    'Antabamba': ['Antabamba', 'El Oro', 'Huaquirca', 'Juan Espinoza Medrano', 'Oropesa', 'Pachaconas', 'Sabaino'],
    'Aymaraes': ['Chalhuanca', 'Calcauso', 'Capaya', 'Caraybamba', 'Chapimarca', 'Colcabamba', 'Cotaruse', 'Huayllo', 'Lucre', 'Pocohuanca', 'Sañayca', 'Soraya', 'Tapairihua', 'Tintay', 'Toraya', 'Yanaca'],
    'Cotabambas': ['Tambobamba', 'Challhuahuacho', 'Coyllurqui', 'Cotabambas', 'Haquira', 'Mara'],
    'Chincheros': ['Chincheros', 'Anco-Huallo', 'Cocharcas', 'Huaccana', 'Ocobamba', 'Ongoy', 'Ranracancha', 'Uranmarca'],
    'Grau': ['Chuquibambilla', 'Curasco', 'Gamarra', 'Huayllati', 'Mamara', 'Mariscal Gamarra', 'Micaela Bastidas', 'Palpacachi', 'Progreso', 'San Antonio', 'Santa Rosa', 'Turpay', 'Vilcabamba', 'Virundo'],
  } },
  'Puno': { provincias: ['Puno', 'Azángaro', 'Carabaya', 'Chucuito', 'El Collao', 'Huancané', 'Lampa', 'Melgar', 'Moho', 'San Antonio de Putina', 'San Román', 'Sandia', 'Yunguyo'], distritos: {
    'Puno': ['Puno', 'Acora', 'Amantaní', 'Atuncolla', 'Capachica', 'Chucuito', 'Coata', 'Huata', 'Mañazo', 'Paucarcolla', 'Pichacani', 'Platería', 'San Antonio', 'Tiquillaca', 'Vilque'],
    'Azángaro': ['Azángaro', 'Achaya', 'Arapa', 'Asillo', 'Caminaca', 'Chupa', 'José Domingo Choquehuanca', 'Muñani', 'Potoni', 'Saman', 'San Antón', 'San José', 'San Juan de Salinas', 'Santiago de Pupuja', 'Tirapata'],
    'Carabaya': ['Macusani', 'Ajoyani', 'Ayapata', 'Coasa', 'Corani', 'Crucero', 'Ituata', 'Ollachea', 'San Gabán', 'Usicayos'],
    'Chucuito': ['Juli', 'Desaguadero', 'Huacullani', 'Kelluyo', 'Pisacoma', 'Pomata', 'Zepita'],
    'El Collao': ['Ilave', 'Capazo', 'Conduriri', 'Pilcuyo', 'Santa Rosa'],
    'Huancané': ['Huancané', 'Cojata', 'Inchupalla', 'Pusi', 'Rosaspata', 'Taraco', 'Vilque Chico', 'Huatasani'],
    'Lampa': ['Lampa', 'Cabanilla', 'Calapuja', 'Nicasio', 'Ocuviri', 'Palca', 'Paratia', 'Pucará', 'Santa Lucía', 'Vilavila'],
    'Melgar': ['Ayaviri', 'Llalli', 'Macari', 'Nuñoa', 'Orurillo', 'Santa Rosa', 'Umachiri'],
    'Moho': ['Moho', 'Conima', 'Huayrapata', 'Tilali'],
    'San Antonio de Putina': ['Putina', 'Ananea', 'Pedro Vilca Apaza', 'Quilcapuncu', 'Sina'],
    'San Román': ['Juliaca', 'Cabana', 'Cabanillas', 'Caracoto'],
    'Sandia': ['Sandia', 'Alto Inambari', 'Cuyocuyo', 'Limbani', 'Patambuco', 'Phara', 'Quiaca', 'Yanahuaya'],
    'Yunguyo': ['Yunguyo', 'Anapia', 'Copani', 'Cuturapi', 'Ollaraya', 'Tinicachi', 'Unicachi'],
  } },
  'Junín': { provincias: ['Huancayo', 'Concepción', 'Chanchamayo', 'Junín', 'Satipo', 'Tarma', 'Yauli', 'Chupaca'], distritos: {
    'Huancayo': ['Huancayo', 'Carhuacallanga', 'Chacapampa', 'Chicche', 'Chilca', 'Chongos Alto', 'Chupuro', 'Colca', 'Cullhuas', 'El Tambo', 'Huacrapuquio', 'Hualhuas', 'Huancán', 'Huasicancha', 'Huayucachi', 'Ingenio', 'Pariahuanca', 'Pilcomayo', 'Pucará', 'Quichuay', 'Quilcas', 'San Agustín', 'San Jerónimo de Tunán', 'Saño', 'Sapallanga', 'Sicaya', 'Santo Domingo de Acobamba', 'Viques'],
    'Concepción': ['Concepción', 'Andamarca', 'Chambara', 'Cochas', 'Comas', 'Heroínas Toledo', 'Manzanares', 'Mariscal Castilla', 'Matahuasi', 'Mito', 'Nueve de Julio', 'Orcotuna', 'San José de Quero', 'Santa Rosa de Ocopa'],
    'Chanchamayo': ['Chanchamayo', 'Perené', 'Pichanaqui', 'San Luis de Shuaro', 'San Ramón', 'Vitoc'],
    'Junín': ['Junín', 'Carhuamayo', 'Ondores', 'Ulcumayo'],
    'Satipo': ['Satipo', 'Coviriali', 'Llaylla', 'Mazamari', 'Pampa Hermosa', 'Pangoa', 'Río Negro', 'Río Tambo', 'Vizcatán del Ene'],
    'Tarma': ['Tarma', 'Acobamba', 'Huaricolca', 'Huasahuasi', 'La Unión', 'Palca', 'Palcamayo', 'San Pedro de Cajas', 'Tapo'],
    'Yauli': ['La Oroya', 'Chacapalpa', 'Huay-Huay', 'Marcapomacocha', 'Morococha', 'Paccha', 'Santa Bárbara de Carhuacayán', 'Santa Rosa de Sacco', 'Suitucancha', 'Yauli'],
    'Chupaca': ['Chupaca', 'Ahuac', 'Chongos Bajo', 'Huachac', 'Huamancaca Chico', 'San Juan de Iscos', 'San Juan de Jarpa', 'Tres de Diciembre', 'Yanacancha'],
  } },
  'Amazonas': { provincias: ['Chachapoyas', 'Bagua', 'Bongará', 'Condorcanqui', 'Luya', 'Rodríguez de Mendoza', 'Utcubamba'], distritos: {
    'Chachapoyas': ['Chachapoyas', 'Asunción', 'Balsas', 'Cheto', 'Chiliquin', 'Chuquibamba', 'Granada', 'Huancas', 'La Jalca', 'Leimebamba', 'Levanto', 'Magdalena', 'Mariscal Castilla', 'Molinopampa', 'Montevideo', 'Olleros', 'Quinjalca', 'San Francisco de Daguas', 'San Isidro de Maino', 'Soloco', 'Sonche'],
    'Bagua': ['Aramango', 'Bagua', 'Copallín', 'El Parco', 'Imaza', 'La Peca'],
    'Bongará': ['Corosha', 'Cuispes', 'Florida', 'Jazán', 'Jumbilla', 'La Florida', 'Shipasbamba', 'Valera', 'Yambrasbamba'],
    'Condorcanqui': ['El Cenepa', 'Nieva', 'Río Santiago'],
    'Luya': ['Lamud', 'Camporredondo', 'Cocabamba', 'Colcamar', 'Conila', 'Inguilpata', 'Longuita', 'Lonya Chico', 'Luya', 'María', 'Ocalli', 'Ocumal', 'Pisuquía', 'Providencia', 'San Cristóbal', 'San Francisco de Yeso', 'San Jerónimo', 'San Juan de Lopecancha', 'Santa Catalina', 'Santo Tomás', 'Tingo', 'Trita'],
    'Rodríguez de Mendoza': ['Cochamal', 'Huambo', 'Limabamba', 'Longar', 'Mariscal Benavides', 'Milpuc', 'Omia', 'Santa Rosa', 'Totora', 'Vista Alegre'],
    'Utcubamba': ['Bagua Grande', 'Cajaruro', 'Cumba', 'El Milagro', 'Jamalca', 'Lonya Grande', 'Yamón'],
  } },
  'Áncash': { provincias: ['Huaraz', 'Aija', 'Antonio Raimondi', 'Asunción', 'Bolognesi', 'Carhuaz', 'Carlos Fermín Fitzcarrald', 'Casma', 'Corongo', 'Huari', 'Huarmey', 'Huaylas', 'Mariscal Luzuriaga', 'Ocros', 'Pallasca', 'Pomabamba', 'Recuay', 'Santa', 'Sihuas', 'Yungay'], distritos: {
    'Huaraz': ['Huaraz', 'Cochabamba', 'Colcabamba', 'Huanchay', 'Independencia', 'Jangas', 'La Libertad', 'Pampas', 'Paucas', 'Pira', 'Tanicá'],
    'Aija': ['Aija', 'Coris', 'Huacllán', 'La Merced', 'Succha'],
    'Antonio Raimondi': ['Aczo', 'Llamellín', 'Mirgas', 'San Juan de Rontoy'],
    'Asunción': ['Acochaca', 'Chacas'],
    'Bolognesi': ['Aquia', 'Cajacay', 'Canis', 'Chiquián', 'Colquioc', 'Huallanca', 'Huasta', 'Huayllacayán', 'La Primavera', 'Mancos', 'Mangas', 'Pacllón', 'San Juan de Rontoy', 'San Miguel de Corpanqui', 'Ticllos'],
    'Carhuaz': ['Carhuaz', 'Acopampa', 'Amashca', 'Anta', 'Ataquero', 'Marcará', 'Pariacoto', 'Paria', 'San Miguel de Aco', 'Shilla', 'Tinco', 'Yungar'],
    'Carlos Fermín Fitzcarrald': ['San Luis', 'San Nicolás', 'Yauya'],
    'Casma': ['Casma', 'Buenavista Alta', 'Comandante Noel', 'Yaután'],
    'Corongo': ['Corongo', 'Aco', 'Bambas', 'Cusca', 'La Pampa', 'Yanac', 'Yupán'],
    'Huari': ['Huari', 'Anra', 'Cajay', 'Chavín de Huántar', 'Huacachi', 'Huacchis', 'Huachis', 'Huantar', 'Masín', 'Paucas', 'Ponto', 'Rahuapampa', 'Rapayán', 'San Marcos', 'San Pedro de Chaná', 'Uco'],
    'Huarmey': ['Huarmey', 'Cochapetí', 'Culebras', 'Huayán', 'Malvas'],
    'Huaylas': ['Caraz', 'Huallanca', 'Huata', 'Huaylas', 'Mato', 'Pamparomas', 'Pueblo Libre', 'Santa Cruz', 'Santo Toribio', 'Yuracmarca'],
    'Mariscal Luzuriaga': ['Piscobamba', 'Eleazar Guzmán Barrón', 'Llama', 'Lucma', 'Musga'],
    'Ocros': ['Ocros', 'Acas', 'Cajamarquilla', 'Carhuapampa', 'Cochas', 'Congas', 'Llipa', 'San Cristóbal de Raján', 'San Pedro', 'Santiago de Chilcas'],
    'Pallasca': ['Cabana', 'Bolognesi', 'Conchucos', 'Huacaschuque', 'Huandoval', 'Lacabamba', 'Llapo', 'Pallasca', 'Pampas', 'Santa Rosa', 'Tauca'],
    'Pomabamba': ['Pomabamba', 'Huayllán', 'Parobamba', 'Quinuabamba'],
    'Recuay': ['Recuay', 'Catac', 'Cotaparaco', 'Huayllapampa', 'Llacllin', 'Marca', 'Pampas Chico', 'Pampas Grande', 'San Miguel de Pallaques', 'Sapac', 'Tapacocha', 'Ticapampa'],
    'Santa': ['Chimbote', 'Cáceres del Perú', 'Coishco', 'Macate', 'Moro', 'Nepeña', 'Samanco', 'Santa', 'Vinzos'],
    'Sihuas': ['Sihuas', 'Acobamba', 'Alfonso Ugarte', 'Cashapampa', 'Huayllabamba', 'Quiches', 'Ragash', 'San Juan', 'Sihuas'],
    'Yungay': ['Yungay', 'Cascapara', 'Manzatán', 'Matacoto', 'Quillo', 'Ranrahirca', 'Shupluy', 'Yanama'],
  } },
  'Cajamarca': { provincias: ['Cajamarca', 'Cajabamba', 'Celandín', 'Chota', 'Contumazá', 'Cutervo', 'Hualgayoc', 'Jaén', 'San Ignacio', 'San Marcos', 'San Miguel', 'San Pablo', 'Santa Cruz'], distritos: {
    'Cajamarca': ['Cajamarca', 'Asunción', 'Chetilla', 'Cospan', 'Encañada', 'Jesús', 'Llacanora', 'Los Baños del Inca', 'Magdalena', 'Matara', 'Namora', 'San Juan'],
    'Cajabamba': ['Cajabamba', 'Cachachi', 'Condebamba', 'Sitacocha'],
    'Celandín': ['Celandín', 'Chumuch', 'Curtovirco', 'Cortegana', 'Huacarbamba', 'Huachinga', 'Irac', 'Matahuasi', 'Miguel Iglesias', 'Miracosta', 'Oxamarca', 'Paccola', 'Querocotillo', 'Quindo', 'Sorochuco', 'Sucre', 'Utco', 'Yumbulag'],
    'Chota': ['Chota', 'Anguía', 'Chadín', 'Chiguirip', 'Chimban', 'Choropampa', 'Cochabamba', 'Conchan', 'Huambos', 'Lajas', 'Llama', 'Miracosta', 'Paccha', 'Pión', 'Querocoto', 'San Juan de Licupis', 'Tacabamba', 'Tocmoche'],
    'Contumazá': ['Contumazá', 'Chilete', 'Cupisnique', 'Guzmango', 'San Benito', 'Tantarica', 'Yonán'],
    'Cutervo': ['Cutervo', 'Callayuc', 'Choros', 'Cujillo', 'La Ramada', 'Pimpingos', 'Querocotillo', 'San Andrés de Cutervo', 'San Juan de Cutervo', 'San Luis de Lucma', 'Santa Cruz', 'Santo Domingo de la Capilla', 'Santo Tomás', 'Socota', 'Toribio Casanova'],
    'Hualgayoc': ['Bambamarca', 'Chugur', 'Hualgayoc'],
    'Jaén': ['Jaén', 'Bellavista', 'Chontali', 'Colasay', 'Huabal', 'Las Pirias', 'Pomahuaca', 'Pucará', 'Sallique', 'San Felipe', 'San José del Alto', 'Santa Rosa'],
    'San Ignacio': ['San Ignacio', 'Chirinos', 'Huarango', 'La Coipa', 'Namballe', 'San José de Lourdes', 'Tabaconas'],
    'San Marcos': ['Pedro Gálvez', 'Chancay', 'Eduardo Villanueva', 'Gregorio Pita', 'Ichocán', 'José Manuel Quiroz', 'José Sabogal', 'San Luis', 'San Nicolás', 'San Pedro de Pichu'],
    'San Miguel': ['San Miguel', 'Bolívar', 'Calquis', 'Catilluc', 'El Prado', 'La Florida', 'Llapa', 'Nanchoc', 'Niepos', 'San Gregorio', 'San Silvestre de Cochán', 'Tongod', 'Unión Agua Blanca'],
    'San Pablo': ['San Pablo', 'Kuntur Wasi', 'Niepos', 'San Bernardino', 'San Luis', 'Tumbaden'],
    'Santa Cruz': ['Santa Cruz', 'Andabamba', 'Catache', 'Chancaybaños', 'La Esperanza', 'Ninabamba', 'Pulan', 'Saucepampa', 'Sexi', 'Uticyacu', 'Yauyucán'],
  } },
  'Huancavelica': { provincias: ['Huancavelica', 'Acobamba', 'Angaraes', 'Castrovirreyna', 'Churcampa', 'Huaytará', 'Tayacaja'], distritos: {
    'Huancavelica': ['Huancavelica', 'Acobambilla', 'Acoria', 'Conayca', 'Cuenca', 'Huachocolpa', 'Huayllahuara', 'Izcuchaca', 'Laria', 'Manta', 'Mariscal Cáceres', 'Moya', 'Nuevo Occoro', 'Palca', 'Pilchaca', 'Vilca', 'Yauli'],
    'Acobamba': ['Acobamba', 'Andabamba', 'Anta', 'Caja', 'Marcas', 'Paucará', 'Pomacocha', 'Rosario'],
    'Angaraes': ['Lircay', 'Anchonga', 'Callanmarca', 'Ccochaccasa', 'Chincho', 'Congalla', 'Huanca-Huanca', 'Huayllay Grande', 'Julcamarca', 'San Antonio de Antaparco', 'Santo Tomás de Pata', 'Secclla'],
    'Castrovirreyna': ['Castrovirreyna', 'Arma', 'Aurahua', 'Capillas', 'Chupamarca', 'Cocas', 'Huachos', 'Huamatambo', 'Mollepampa', 'San Juan', 'Santa Ana', 'Ticrapo'],
    'Churcampa': ['Churcampa', 'Anco', 'Chinchihuasi', 'El Carmen', 'Huacchos', 'Huaribamba', 'Locroja', 'Paucarbamba', 'San Miguel de Mayocc', 'San Pedro de Coris'],
    'Huaytará': ['Huaytará', 'Ayavi', 'Córdova', 'Huayacundo Arma', 'Laramarca', 'Ocoyo', 'Pilpichaca', 'Querco', 'Quito-Arma', 'San Antonio de Cusicancha', 'San Francisco de Sangayaico', 'San Isidro', 'Santiago de Chocorvos', 'Santiago de Quirahuara', 'Santo Domingo de Capillas', 'Tambo'],
    'Tayacaja': ['Pampas', 'Acostambo', 'Acraquia', 'Ahuaycha', 'Colcabamba', 'Daniel Hernández', 'Huachocolpa', 'Pazos', 'Quishuar', 'Salcahuasi', 'San Marcos de Rocchac', 'Surcubamba', 'Tintay Puncu'],
  } },
  'Huánuco': { provincias: ['Huánuco', 'Ambo', 'Dos de Mayo', 'Huacaybamba', 'Huamalíes', 'Leoncio Prado', 'Marañón', 'Pachitea', 'Puerto Inca', 'Lauricocha', 'Yarowilca'], distritos: {
    'Huánuco': ['Huánuco', 'Amarilis', 'Chinchao', 'Churubamba', 'Margos', 'Pillco Marca', 'Quisqui', 'San Francisco de Cayrán', 'San Pedro de Chaulán', 'Santa María del Valle', 'Yarumayo'],
    'Ambo': ['Ambo', 'Cayna', 'Colpas', 'Conchamarca', 'Huácar', 'San Francisco', 'San Rafael', 'Tomay Kichwa'],
    'Dos de Mayo': ['La Unión', 'Baños', 'Chuquis', 'Marias', 'Pachas', 'Quivilla', 'Ripán', 'Shunqui', 'Sillapata', 'Yanas'],
    'Huacaybamba': ['Huacaybamba', 'Canchabamba', 'Cochabamba', 'Pinra'],
    'Huamalíes': ['Llata', 'Arancay', 'Chavín de Pariarca', 'Jacas Grande', 'Jircan', 'Miraflores', 'Monzón', 'Punchao', 'Puños', 'Singa', 'Tantamayo'],
    'Leoncio Prado': ['Rupa-Rupa', 'Daniel Alomía Robles', 'Hermílio Valdizán', 'José Crespo y Castillo', 'Luyando', 'Mariano Dámaso Beraún', 'Pucayacu'],
    'Marañón': ['Huacrachuco', 'Cholón', 'San Buenaventura'],
    'Pachitea': ['Panao', 'Chaglla', 'Molino', 'Umari'],
    'Puerto Inca': ['Puerto Inca', 'Codo del Pozuzo', 'Honoria', 'Irazola', 'Tournavista', 'Yuyapichis'],
    'Lauricocha': ['Jesús', 'Baños', 'Jivia', 'Queropalca', 'Rondos', 'San Francisco de Asís', 'San Miguel de Cauri'],
    'Yarowilca': ['Chavinillo', 'Aparicio Pomares', 'Cahuac', 'Choras', 'Jacas Chico', 'Obas', 'Pampamarca'],
  } },
  'Ica': { provincias: ['Ica', 'Chincha', 'Nasca', 'Palpa', 'Pisco'], distritos: {
    'Ica': ['Ica', 'La Tinguiña', 'Los Aquijes', 'Ocucaje', 'Pachacútec', 'Parcona', 'Pueblo Nuevo', 'Salas', 'San José de Los Molinos', 'San Juan Bautista', 'Santiago', 'Subtanjalla', 'Tate', 'Yauca del Rosario'],
    'Chincha': ['Chincha Alta', 'Alto Larán', 'Chavín', 'Chincha Baja', 'El Carmen', 'Grocio Prado', 'Pueblo Nuevo', 'San Juan de Yanac', 'San Pedro de Huacarpana', 'Sunampe', 'Tambo de Mora'],
    'Nasca': ['Nasca', 'Changuillo', 'El Ingenio', 'Marcona', 'Vista Alegre'],
    'Palpa': ['Palpa', 'Llipata', 'Río Grande', 'Santa Cruz', 'Tibillo'],
    'Pisco': ['Pisco', 'Huancano', 'Humay', 'Independencia', 'Paracas', 'San Andrés', 'San Clemente', 'Túpac Amaru Inca'],
  } },
  'La Libertad': { provincias: ['Trujillo', 'Ascope', 'Bolívar', 'Chepén', 'Julcán', 'Otuzco', 'Pacasmayo', 'Pataz', 'Sánchez Carrión', 'Santiago de Chuco', 'Gran Chimú', 'Virú'], distritos: {
    'Trujillo': ['Trujillo', 'El Porvenir', 'Florencia de Mora', 'Huanchaco', 'La Esperanza', 'Laredo', 'Moche', 'Poroto', 'Salaverry', 'Simbal', 'Víctor Larco Herrera'],
    'Ascope': ['Ascope', 'Chocope', 'Casa Grande', 'Chicama', 'Magdalena de Cao', 'Paiján', 'Rázuri', 'Santiago de Cao'],
    'Bolívar': ['Bolívar', 'Bambamarca', 'Condormarca', 'Longotea', 'Uchumarca', 'Ucuncha'],
    'Chepén': ['Chepén', 'Malabrigo', 'Pacanga'],
    'Julcán': ['Julcán', 'Calamarca', 'Carabamba', 'Huaso'],
    'Otuzco': ['Otuzco', 'Agallpampa', 'Charat', 'Huaranchal', 'La Cuesta', 'Mache', 'Paranday', 'Salpo', 'Sinsicap', 'Usquil'],
    'Pacasmayo': ['San Pedro de Lloc', 'Guadalupe', 'Jequetepeque', 'Pacasmayo', 'Tecapa'],
    'Pataz': ['Tayabamba', 'Buldibuyo', 'Chillia', 'Huancaspata', 'Huaylillas', 'Huayo', 'Ongon', 'Parcoy', 'Pataz', 'Pías', 'Santiago de Challas', 'Taurija', 'Urpay'],
    'Sánchez Carrión': ['Huamachuco', 'Chugay', 'Cochorco', 'Curgos', 'Marcabal', 'Sanagoran', 'Sarin', 'Sartimbamba'],
    'Santiago de Chuco': ['Santiago de Chuco', 'Angasmarca', 'Cachicadán', 'Mollebamba', 'Mollepata', 'Quiruvilca', 'Santa Cruz de Chuca', 'Sitabamba'],
    'Gran Chimú': ['Cascas', 'Lucma', 'Marmot', 'Sayapullo'],
    'Virú': ['Virú', 'Chao', 'Guadalupito'],
  } },
  'Lambayeque': { provincias: ['Chiclayo', 'Ferreñafe', 'Lambayeque'], distritos: {
    'Chiclayo': ['Chiclayo', 'Cayaltí', 'Chongoyape', 'Eten', 'Eten Puerto', 'José Leonardo Ortiz', 'La Victoria', 'Lagunas', 'Monsefú', 'Nueva Arica', 'Oyotún', 'Picsi', 'Pimentel', 'Pomalca', 'Pucalá', 'Reque', 'Santa Rosa', 'Saña', 'Tumán', 'Pátapo'],
    'Ferreñafe': ['Ferreñafe', 'Cañaris', 'Incahuasi', 'Manuel Antonio Mesones Muro', 'Pitipo', 'Pueblo Nuevo'],
    'Lambayeque': ['Lambayeque', 'Chóchope', 'Illimo', 'Jayanca', 'Mochumí', 'Mórrope', 'Motupe', 'Olmos', 'Pacora', 'Salas', 'San José', 'Tucume'],
  } },
  'Loreto': { provincias: ['Maynas', 'Alto Amazonas', 'Loreto', 'Mariscal Ramón Castilla', 'Requena', 'Ucayali', 'Datem del Marañón', 'Putumayo'], distritos: {
    'Maynas': ['Iquitos', 'Alto Nanay', 'Fernando Lores', 'Indiana', 'Las Amazonas', 'Mazan', 'Napo', 'Punchana', 'Belén', 'San Juan Bautista', 'Torres Causana', 'Yaquerana'],
    'Alto Amazonas': ['Yurimaguas', 'Balsapuerto', 'Cahuapanas', 'Jeberos', 'Lagunas', 'Santa Cruz', 'Teniente César López Rojas'],
    'Loreto': ['Nauta', 'Loreto', 'Parinari', 'Tigre', 'Trompeteros', 'Urarinas'],
    'Mariscal Ramón Castilla': ['Caballococha', 'Pebas', 'Ramón Castilla', 'San Pablo'],
    'Requena': ['Requena', 'Alto Tapiche', 'Capelo', 'Emilio San Martín', 'Jenaro Herrera', 'Maquia', 'Puinahua', 'Saquena', 'Soplin', 'Tapiche'],
    'Ucayali': ['Contamana', 'Inahuaya', 'Padre Márquez', 'Pampa Hermosa', 'Sarayacu', 'Vargas Guerra'],
    'Datem del Marañón': ['San Lorenzo', 'Andoas', 'Barranca', 'Cahuapanas', 'Manseriche', 'Morona', 'Pastaza'],
    'Putumayo': ['San Antonio del Estrecho', 'Putumayo', 'Rosa Panduro', 'Teniente Manuel Clavero', 'Yaguas'],
  } },
  'Madre de Dios': { provincias: ['Tambopata', 'Manu', 'Tahuamanu'], distritos: {
    'Tambopata': ['Tambopata', 'Inambari', 'Las Piedras', 'Laberinto'],
    'Manu': ['Manu', 'Fitzcarrald', 'Huepetuhe', 'Madre de Dios'],
    'Tahuamanu': ['Iñapari', 'Iberia', 'Tahuamanu'],
  } },
  'Moquegua': { provincias: ['Mariscal Nieto', 'General Sánchez Cerro', 'Ilo'], distritos: {
    'Mariscal Nieto': ['Moquegua', 'Carumas', 'Cuchumbaya', 'Samegua', 'San Cristóbal', 'Torata'],
    'General Sánchez Cerro': ['Omate', 'Coalaque', 'Chojata', 'Ichuña', 'La Capilla', 'Lloque', 'Matalaque', 'Puquina', 'Quinistaquillas', 'Ubinas', 'Yunga'],
    'Ilo': ['Ilo', 'El Algarrobal', 'Pacocha'],
  } },
  'Pasco': { provincias: ['Pasco', 'Daniel Alcides Carrión', 'Oxapampa'], distritos: {
    'Pasco': ['Chaupimarca', 'Huachón', 'Huariaca', 'Huayllay', 'Ninacaca', 'Pallanchacra', 'Paucartambo', 'San Francisco de Asís de Yarusyacán', 'Simón Bolívar', 'Ticlacayán', 'Tinyahuarco', 'Vicco', 'Yanacancha'],
    'Daniel Alcides Carrión': ['Yanahuanca', 'Chacayán', 'Goyllarisquizga', 'Paucar', 'San Pedro de Pillao', 'Santa Ana de Tusi', 'Tapuc', 'Vilcabamba'],
    'Oxapampa': ['Oxapampa', 'Chontabamba', 'Huancabamba', 'Palaz', 'Pozuzo', 'Puerto Bermúdez', 'Villa Rica', 'Constitución'],
  } },
  'Piura': { provincias: ['Piura', 'Ayabaca', 'Huancabamba', 'Morropón', 'Paita', 'Sechura', 'Sullana', 'Talara'], distritos: {
    'Piura': ['Piura', 'Castilla', 'Catacaos', 'Cura Mori', 'El Tallan', 'La Arena', 'La Unión', 'Las Lomas', 'Tambogrande', 'Veintiseis de Octubre'],
    'Ayabaca': ['Ayabaca', 'Frías', 'Jililí', 'Lagunas', 'Montero', 'Pacaipampa', 'Paimas', 'Sapillica', 'Sicchez', 'Suyo'],
    'Huancabamba': ['Huancabamba', 'Canchaque', 'El Carmen de la Frontera', 'Huarmaca', 'Lalaquiz', 'San Miguel del Faique', 'Sondor', 'Sondorillo'],
    'Morropón': ['Chulucanas', 'Buenos Aires', 'Chalaco', 'La Matanza', 'Morropón', 'Salitral', 'San Juan de Bigote', 'Santa Catalina de Mossa', 'Santo Domingo', 'Yamango'],
    'Paita': ['Paita', 'Amotape', 'Arenal', 'Colan', 'La Huaca', 'Lobitos', 'Los Órganos', 'Mancora', 'Tamarindo', 'Vichayal'],
    'Sechura': ['Sechura', 'Bellavista de La Unión', 'Bernal', 'Cristo Nos Valga', 'Rinconada Llicuar', 'Vice'],
    'Sullana': ['Sullana', 'Bellavista', 'Ignacio Escudero', 'Lancones', 'Marcavelica', 'Miguel Checa', 'Querecotillo', 'Salatí', 'San Juan de Bigote'],
    'Talara': ['Talara', 'El Alto', 'La Brea', 'Lobitos', 'Los Órganos', 'Máncora', 'Pariñas'],
  } },
  'San Martín': { provincias: ['Moyobamba', 'Bellavista', 'El Dorado', 'Huallaga', 'Lamas', 'Mariscal Cáceres', 'Picota', 'Rioja', 'San Martín', 'Tocache'], distritos: {
    'Moyobamba': ['Moyobamba', 'Calzada', 'Habana', 'Jepelacio', 'Soritor', 'Yantalo'],
    'Bellavista': ['Bellavista', 'Alto Biavo', 'Bajo Biavo', 'Huallaga', 'San Pablo', 'San Rafael'],
    'El Dorado': ['San José de Sisa', 'Agua Blanca', 'San Martín', 'Santa Rosa', 'Shatoja'],
    'Huallaga': ['Saposoa', 'Alto Saposoa', 'El Eslabón', 'Piscoyacu', 'Sacanche', 'Tingo de Saposoa'],
    'Lamas': ['Lamas', 'Alonso de Alvarado', 'Barranquita', 'Cacatachi', 'Chazuta', 'Chipurana', 'Cuñumbuqui', 'Pinto Recodo', 'Rumisapa', 'San Roque de Cumbaza', 'Shanao', 'Tabalosos', 'Zapatero'],
    'Mariscal Cáceres': ['Juanjuí', 'Campanilla', 'Huicungo', 'Pachiza', 'Pajarillo'],
    'Picota': ['Picota', 'Buenos Aires', 'Caspisapa', 'Pilluana', 'Pucacaca', 'San Cristóbal', 'San Hilarión', 'Tingo de Ponasa', 'Tres Unidos'],
    'Rioja': ['Rioja', 'Awajún', 'Elias Soplin Vargas', 'Nueva Cajamarca', 'Pardo Miguel', 'Polvora', 'San Fernando', 'Yorongos'],
    'San Martín': ['Tarapoto', 'Alberto Leveau', 'Cacatachi', 'Chazuta', 'Chipurana', 'El Porvenir', 'Huimbayoc', 'Juan Guerra', 'La Banda de Shilcayo', 'Morales', 'Papaplaya', 'San Antonio', 'Sauce', 'Shapaja'],
    'Tocache': ['Tocache', 'Nuevo Progreso', 'Pólvora', 'Shunte', 'Uchiza'],
  } },
  'Tacna': { provincias: ['Tacna', 'Candarave', 'Jorge Basadre', 'Tarata'], distritos: {
    'Tacna': ['Tacna', 'Alto de la Alianza', 'Calana', 'Ciudad Nueva', 'Inclán', 'Pachia', 'Palca', 'Pocollay', 'Sama', 'Coronel Gregorio Albarracín Lanchipa'],
    'Candarave': ['Candarave', 'Cairani', 'Camilaca', 'Curibaya', 'Huanuara', 'Quilahuani'],
    'Jorge Basadre': ['Locumba', 'Ite', 'Ilabaya'],
    'Tarata': ['Tarata', 'Estique', 'Estique Pampa', 'Sitajara', 'Susapaya', 'Tarucachi'],
  } },
  'Tumbes': { provincias: ['Tumbes', 'Contralmirante Villar', 'Zarumilla'], distritos: {
    'Tumbes': ['Tumbes', 'Corrales', 'La Cruz', 'Pampas de Hospital', 'San Jacinto', 'San Juan de la Virgen'],
    'Contralmirante Villar': ['Zorritos', 'Casitas'],
    'Zarumilla': ['Zarumilla', 'Aguas Verdes', 'Matapalo', 'Papayal'],
  } },
  'Ucayali': { provincias: ['Coronel Portillo', 'Atalaya', 'Padre Abad', 'Purús'], distritos: {
    'Coronel Portillo': ['Callería', 'Campoverde', 'Iparia', 'Masisea', 'Yarinacocha', 'Nueva Requena', 'Manantay'],
    'Atalaya': ['Raymondi', 'Sepahua', 'Tahuanía', 'Yurúa'],
    'Padre Abad': ['Aguaytía', 'Irazola', 'Von Humboldt', 'Curimaná'],
    'Purús': ['Purús'],
  } },
  'Callao': { provincias: ['Callao'], distritos: { 'Callao': ['Bellavista', 'Callao', 'Carmen de la Legua Reynoso', 'La Perla', 'La Punta', 'Mi Perú', 'Ventanilla'] } },
};

@Component({
  selector: 'app-reclamaciones',
  imports: [FormsModule],
  templateUrl: './reclamaciones.html',
  styleUrl: './reclamaciones.css',
})
export class Reclamaciones implements OnInit {
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);
  private zone = inject(NgZone);

  activeTab: 'form' | 'seguimiento' = 'form';

  isSubmitting = false;
  showSuccess = false;
  trackingCodeResult = '';
  claimNumber = '';
  submitError = '';

  isSearching = false;
  searchCode = '';
  searchDni = '';
  searchResult: any = null;
  searchError = '';

  readonly departamentos = Object.keys(PERU_DATA).sort();
  provincias: string[] = [];
  distritos: string[] = [];
  parentProvincias: string[] = [];
  parentDistritos: string[] = [];

  serviceOptions = [
    'Matrícula / Inscripción',
    'Pago de Pensión / Colegiatura',
    'Servicio de Alimentación',
    'Servicio de Transporte',
    'Actividad Extracurricular',
    'Servicio de Biblioteca',
    'Servicio de Informática / Laboratorio',
    'Certificados / Diplomas',
    'Otro (especificar)',
  ];
  selectedServices: string[] = [];
  otroServicio = '';
  showOtroServicio = false;

  form = {
    doc_type: '',
    dni: '',
    apellido_paterno: '',
    apellido_materno: '',
    nombres: '',
    telefono: '',
    email: '',
    department: '',
    province: '',
    district: '',
    domicilio: '',
    is_minor: false,
    parent_doc_type: '',
    parent_dni: '',
    parent_apellido_paterno: '',
    parent_apellido_materno: '',
    parent_nombres: '',
    parent_telefono: '',
    parent_email: '',
    parent_department: '',
    parent_province: '',
    parent_district: '',
    parent_domicilio: '',
    amount: '',
    service_description: '',
    claim_description: '',
    claim_request: '',
    claim_type: '',
    declaration: false,
  };

  captchaCode = '';
  captchaInput = '';
  captchaError = '';
  currentDate = '';
  triedSubmit = false;

  ngOnInit(): void {
    this.generateCaptcha();
    this.currentDate = new Date().toLocaleDateString('es-PE', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit'
    });
  }

  generateCaptcha(): void {
    this.captchaCode = Math.floor(10000 + Math.random() * 90000).toString();
    this.captchaInput = '';
  }

  onDepartmentChange(): void {
    this.form.province = '';
    this.form.district = '';
    this.distritos = [];
    const dept = PERU_DATA[this.form.department];
    this.provincias = dept ? dept.provincias : [];
  }

  onProvinceChange(): void {
    this.form.district = '';
    const dept = PERU_DATA[this.form.department];
    this.distritos = dept?.distritos[this.form.province] ?? [];
  }

  onParentDepartmentChange(): void {
    this.form.parent_province = '';
    this.form.parent_district = '';
    this.parentDistritos = [];
    const dept = PERU_DATA[this.form.parent_department];
    this.parentProvincias = dept ? dept.provincias : [];
  }

  onParentProvinceChange(): void {
    this.form.parent_district = '';
    const dept = PERU_DATA[this.form.parent_department];
    this.parentDistritos = dept?.distritos[this.form.parent_province] ?? [];
  }

  toggleService(service: string): void {
    const idx = this.selectedServices.indexOf(service);
    if (idx >= 0) {
      this.selectedServices.splice(idx, 1);
    } else {
      this.selectedServices.push(service);
    }
    this.showOtroServicio = this.selectedServices.includes('Otro (especificar)');
    if (!this.showOtroServicio) this.otroServicio = '';
  }

  isServiceSelected(service: string): boolean {
    return this.selectedServices.includes(service);
  }

  enviar(form?: NgForm): void {
    if (this.isSubmitting) return;
    this.submitError = '';
    this.captchaError = '';
    this.triedSubmit = true;

    if (form && form.invalid) {
      Object.values(form.controls).forEach(c => c.markAsTouched());
      this.submitError = 'Complete los campos obligatorios marcados en rojo.';
      setTimeout(() => document.querySelector('.is-invalid, .is-invalid-group')
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' }));
      return;
    }

    if (this.captchaInput !== this.captchaCode) {
      this.captchaError = 'El código no coincide. Escriba el que se muestra o genere otro.';
      this.generateCaptcha();
      setTimeout(() => document.querySelector('#rec-captcha')
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' }));
      return;
    }
    if (this.selectedServices.length === 0) {
      this.submitError = 'Debes seleccionar al menos un tipo de servicio.';
      return;
    }
    if (!this.form.claim_type) {
      this.submitError = 'Debes seleccionar el tipo de reclamación.';
      return;
    }
    if (!this.form.declaration) {
      this.submitError = 'Debes aceptar la declaración jurada.';
      return;
    }
    if (!this.form.department) {
      this.submitError = 'Selecciona el Departamento.';
      return;
    }
    if (!this.form.province) {
      this.submitError = 'Selecciona la Provincia.';
      return;
    }
    if (!this.form.district) {
      this.submitError = 'Selecciona el Distrito.';
      return;
    }
    if (this.form.is_minor) {
      if (!this.form.parent_department) {
        this.submitError = 'Selecciona el Departamento del representante.';
        return;
      }
      if (!this.form.parent_province) {
        this.submitError = 'Selecciona la Provincia del representante.';
        return;
      }
      if (!this.form.parent_district) {
        this.submitError = 'Selecciona el Distrito del representante.';
        return;
      }
    }

    const services = this.showOtroServicio && this.otroServicio
      ? [...this.selectedServices.filter(s => s !== 'Otro (especificar)'), this.otroServicio]
      : this.selectedServices.filter(s => s !== 'Otro (especificar)');

    const payload = {
      ...this.form,
      is_minor: this.form.is_minor,
      service_type: JSON.stringify(services),
      amount: this.form.amount || null,
    };

    this.isSubmitting = true;

    this.http.post<any>(`${environment.apiUrl}/reclamaciones/create`, payload)
      .pipe(timeout(5000))
      .subscribe({
        next: (res) => {
          this.zone.run(() => {
            this.isSubmitting = false;
            this.trackingCodeResult = res.tracking_code;
            this.claimNumber = String(res.id).padStart(8, '0');
            this.showSuccess = true;
            this.cdr.detectChanges();
          });
        },
        error: (err) => {
          this.zone.run(() => {
            this.isSubmitting = false;
            this.submitError = err.name === 'TimeoutError'
              ? 'El servidor tardó demasiado. Intente nuevamente.'
              : (err.error?.error || 'Error al enviar. Intente nuevamente.');
            this.generateCaptcha();
            this.cdr.detectChanges();
          });
        }
      });
  }

  nuevoReclamo(): void {
    this.showSuccess = false;
    this.submitError = '';
    this.captchaError = '';
    this.triedSubmit = false;
    this.trackingCodeResult = '';
    this.claimNumber = '';
    this.selectedServices = [];
    this.otroServicio = '';
    this.showOtroServicio = false;
    this.form = {
      doc_type: '', dni: '', apellido_paterno: '', apellido_materno: '', nombres: '',
      telefono: '', email: '', department: '', province: '', district: '', domicilio: '',
      is_minor: false, parent_doc_type: '', parent_dni: '', parent_apellido_paterno: '',
      parent_apellido_materno: '', parent_nombres: '', parent_telefono: '', parent_email: '',
      parent_department: '', parent_province: '', parent_district: '', parent_domicilio: '',
      amount: '', service_description: '', claim_description: '', claim_request: '',
      claim_type: '', declaration: false,
    };
    this.generateCaptcha();
  }

  buscarReclamo(): void {
    if (this.isSearching) return;
    if (!this.searchCode.trim() && !this.searchDni.trim()) {
      this.searchError = 'Ingresa un código de seguimiento o DNI para buscar.';
      return;
    }
    this.isSearching = true;
    this.searchError = '';
    this.searchResult = null;

    this.http.get<any[]>(`${environment.apiUrl}/reclamaciones/list`)
      .pipe(timeout(12000))
      .subscribe({
        next: (list) => {
          this.zone.run(() => {
            this.isSearching = false;
            const found = list.find(r =>
              (this.searchCode.trim() && r.tracking_code === this.searchCode.trim()) ||
              (this.searchDni.trim() && r.dni === this.searchDni.trim())
            );
            if (found) {
              this.searchResult = found;
            } else {
              this.searchError = 'No se encontró ningún reclamo con los datos ingresados.';
            }
            this.cdr.detectChanges();
          });
        },
        error: (err) => {
          this.zone.run(() => {
            this.isSearching = false;
            this.searchError = err.name === 'TimeoutError'
              ? 'El servidor tardó demasiado. Intente nuevamente.'
              : 'Error al buscar. Intente nuevamente.';
            this.cdr.detectChanges();
          });
        }
      });
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      'Pendiente': 'status-pendiente',
      'En Proceso': 'status-proceso',
      'Respondido': 'status-respondido',
      'Cerrado': 'status-cerrado',
    };
    return map[status] || 'status-pendiente';
  }

  formatId(id: number): string {
    return String(id).padStart(8, '0');
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('es-PE', {
      day: '2-digit', month: 'long', year: 'numeric'
    });
  }
}