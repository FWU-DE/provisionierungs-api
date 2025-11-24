export class OfferCategories {
  category?: string[];
  competency?: string[];
  gradeLevel?: string[];
  schoolType?: string[];
  ['x-class-name']?: string;

  constructor(data: OfferCategories) {
    this.category = data.category;
    this.competency = data.competency;
    this.gradeLevel = data.gradeLevel;
    this.schoolType = data.schoolType;
    this['x-class-name'] = data['x-class-name'];
  }
}
