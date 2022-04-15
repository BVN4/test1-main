class Task {

	constructor({ skus, categories, shop_skus }){
		this.skus = this.array2hash(skus);
		this.categories = this.array2hash(categories);
		this.#generateTree();
		this.shop_skus = this.make_shop_skus_array(shop_skus);
	}

	/**
	* Добавляет в хеш-таблицу дочерние категории и атрибуты
	*/
	#generateTree(){
		this.headCategories = [];
		for(const c in this.categories){
			this.categories[c].skus = [];
			this.categories[c].categories = [];
			if(!this.categories[c].parent_id){
				this.headCategories.push(c);
				continue;
			}
			if(!this.categories[this.categories[c].parent_id].categories)
				this.categories[this.categories[c].parent_id].categories = [];
			this.categories[this.categories[c].parent_id].categories.push(c);
		}

		for(const s in this.skus){
			this.categories[this.skus[s].category_id].skus.push(s);
		}
	}

	/**
	* Отрисовка дерева каталогов и товаров. Может принять массив ID каталогов, которые нужно отфильтровать
	* @param  {Array}  filter Массив ID каталогов, которые будут выведены
	* @return {String}
	*/
	renderTree(filter){
		this.text = 'Tree:';
		this.originalFilter = filter ?? [];
		this.filter = false;

		if(filter) this.#updateFilter(filter);

		for(const c of this.#getFilteredArray(this.headCategories))
		this.#addTreeText(c, this.categories[c], 1, [c]);

		let pre = document.createElement('pre');
		pre.innerHTML = this.text;
		document.body.append(pre);
		document.body.append(document.createElement('hr'));
	}

	/**
	* Добавляет в текст строку с элементом и его дочерние элементы
	* @param {String} id   ID элемента
	* @param {Object} item Объект элемента
	* @param {Number} lvl  Отступ
	* @param {Array}  path Путь
	*/
	#addTreeText(id, item, lvl, path){
		this.text += '<br>' + this.#getSpace(lvl*2) + '-- ' + item.name;

		if(item.categories)
			for(const c of this.#getFilteredArray(item.categories))
				this.#addTreeText(c, this.categories[c], lvl + 1, [...path, ...[c]]);

		if(item.skus && (!this.originalFilter.length || this.originalFilter.filter(i => path.includes(i)).length))
		for(const s of item.skus)
		this.#addTreeText(s, this.skus[s], lvl + 1, path);
	}

	/**
	* Возвращает строку с указанным количеством пробелов
	* @param  {Number} length
	* @return {String}
	*/
	#getSpace(length){
		let str = '';
		while(str.length < length) str += ' ';
		return str;
	}


	/**
	* Обновление this.filter
	* @param {Array} filter
	*/
	#updateFilter(filter){
		this.filter = [];

		for(const f in filter)
		filter[f] = String(filter[f]);

		for(const c in this.categories){
			if(!filter.includes(c)) continue;

			this.#addFilter(c);
		}
	}

	/**
	* Добавляет в this.filter выбранную категорю и его родителя
	* @param {String} c ID категории
	*/
	#addFilter(c){
		this.filter.push(c);

		if(this.categories[c].parent_id)
			this.#addFilter(String(this.categories[c].parent_id));
	}

	/**
	* Фильтрует массив
	* @param  {Array} arr Массив
	* @return {Array} arr
	*/
	#getFilteredArray(arr){
		if(!this.filter) return arr;
		return arr.filter(i => this.filter.includes(i));
	}


	/**
	* Возвращает хеш-таблицу массива
	* @param  {Array} array Массив
	* @return {Object}      Хеш-массив
	*/
	array2hash(array){
		let hash = {};
		for(const item of array){
			let data = {};
			for(let i in item)
			data[i] = item[i];
			delete data.id;
			hash[item.id] = data;
		}
		return hash;
	}


	/**
	* Преобразование shop_skus в массив объектов
	* @param  {Object} shop_skus
	* @return {Array}
	*/
	make_shop_skus_array(shop_skus){
		let skus_array = [];

		for(const matrix_type_id in shop_skus){
			for(const shop_id in shop_skus[matrix_type_id]){
				for(const skus of shop_skus[matrix_type_id][shop_id]){
					let data = {};
					skus.shop_id = shop_id;
					skus.matrix_type_id = matrix_type_id;

					for(let i in skus) data[i] = skus[i];

					skus_array.push(skus);
				}
			}
		}

		return skus_array;
	}

}

const t = new Task(mobile_init);
console.log(t.categories, t.skus); // Task 0

t.renderTree(); // Task 1
t.renderTree(['169', '172']); // Task 2

console.log(t.shop_skus); // Task 3
