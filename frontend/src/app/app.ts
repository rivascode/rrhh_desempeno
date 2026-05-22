import { HttpClient } from '@angular/common/http';
import { DatePipe, JsonPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  Competency,
  LikertOption,
  climateQuestions,
  competencies,
  likertOptions,
  likertScore,
  openQuestions,
  scaleQuestions,
  suggestedCourses,
} from './form-data';

type ViewMode = 'portal' | 'trabajador' | 'jefe' | 'rrhh' | 'encuestas';
type PortalRole = 'trabajador' | 'jefe' | 'rrhh';
type ResponseType = 'likert' | 'single_choice' | 'multiple_choice' | 'short_text' | 'long_text' | 'scale';

interface ClimateSubmission {
  type: 'climate';
  createdAt: string;
  employee: Record<string, string>;
  likert: Record<number, string>;
  scales: Record<number, number>;
  open: Record<number, string>;
  multiple: Record<number, string[]>;
}

interface PerformanceSubmission {
  type: 'performance';
  createdAt: string;
  general: Record<string, string>;
  scores: Record<string, number>;
  evidence: Record<string, string>;
  potential: number;
  potentialComment: string;
  objectives: ObjectiveRow[];
  trainings: TrainingRow[];
  feedback: FeedbackRow[];
  agreement: string;
  employeeComment: string;
}

interface ObjectiveRow {
  objective: string;
  description: string;
  weight: number;
  unit: string;
  target: string;
  result: number;
}

interface TrainingRow {
  course: string;
  competency: string;
  priority: number;
}

interface FeedbackRow {
  competency: string;
  strength: string;
  improvement: string;
}

interface DashboardSummary {
  climateCount: number;
  performanceCount: number;
  climateAverage: number;
  performanceAverage: number;
  climateStatus: string;
  dimensionScores: { label: string; value: number }[];
  competencyScores: { label: string; value: number }[];
  likertDistribution: { label: string; value: number }[];
}

interface PersonStatus {
  dni: string;
  name: string;
  area: string;
  position: string;
  bossDni: string;
  climateDone: boolean;
  performanceDone: boolean;
}

interface SurveyQuestion {
  id: number;
  section: string;
  text: string;
  responseType: ResponseType;
  required: boolean;
  options?: string[];
  lowLabel?: string;
  highLabel?: string;
}

interface SurveyDefinition {
  id: string;
  name: string;
  description: string;
  audience: 'Trabajador' | 'Jefe' | 'RRHH';
  status: 'Activa' | 'Borrador';
  cycle: string;
  channel: string;
  questions: SurveyQuestion[];
}

interface ProcessSummary {
  id: string;
  name: string;
  kind: string;
  target: number;
  completed: number;
  pending: number;
  progress: number;
  status: string;
}

const apiBase = 'http://127.0.0.1:8081/api/index.php';

@Component({
  selector: 'app-root',
  imports: [FormsModule, DatePipe, JsonPipe],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private readonly http = inject(HttpClient);

  protected readonly view = signal<ViewMode>('portal');
  protected readonly loggedIn = signal(false);
  protected readonly activeRole = signal<PortalRole>('trabajador');
  protected readonly saving = signal(false);
  protected readonly message = signal('');
  protected readonly records = signal<(ClimateSubmission | PerformanceSubmission)[]>([]);
  protected readonly climateQuestions = climateQuestions;
  protected readonly scaleQuestions = scaleQuestions;
  protected readonly openQuestions = openQuestions;
  protected readonly responseTypes: { value: ResponseType; label: string }[] = [
    { value: 'likert', label: 'Escala Likert' },
    { value: 'single_choice', label: 'Seleccion simple' },
    { value: 'multiple_choice', label: 'Seleccion multiple' },
    { value: 'short_text', label: 'Texto corto' },
    { value: 'long_text', label: 'Texto largo' },
    { value: 'scale', label: 'Escala 0 a 10' },
  ];
  protected readonly likertDefaultOptions = ['NUNCA', 'CASI NUNCA', 'A VECES', 'CASI SIEMPRE', 'SIEMPRE'];
  protected readonly likertOptions = likertOptions;
  protected readonly competencies = competencies;
  protected readonly suggestedCourses = suggestedCourses;
  protected readonly employees: PersonStatus[] = [
    { dni: '40112233', name: 'Ana Torres', area: 'Importacion', position: 'Liquidador', bossDni: '10998877', climateDone: false, performanceDone: false },
    { dni: '42114455', name: 'Carlos Medina', area: 'Exportacion', position: 'Sectorista', bossDni: '10998877', climateDone: true, performanceDone: false },
    { dni: '43889911', name: 'Lucia Rojas', area: 'Sistemas', position: 'Analista', bossDni: '10887766', climateDone: false, performanceDone: true },
    { dni: '45667788', name: 'Miguel Salas', area: 'Contabilidad', position: 'Asistente', bossDni: '10776655', climateDone: true, performanceDone: true },
  ];
  protected workerDni = '40112233';
  protected bossDni = '10998877';
  protected hrDni = '70001122';
  protected loginDni = '40112233';
  protected loginPassword = '';
  protected loginPortal: PortalRole = 'trabajador';
  protected activeCycle = 'Evaluacion anual 2026';
  protected reminderChannel = 'Correo y WhatsApp';
  protected reminderMessage = '';
  protected trackingQuery = '';
  protected trackingProcessId = 'all';
  protected trackingStatus: 'all' | 'pending' | 'done' = 'all';
  protected surveys: SurveyDefinition[] = [
    {
      id: 'clima-laboral',
      name: 'Encuesta de clima laboral',
      description: 'Encuesta para trabajadores basada en los libros de clima laboral.',
      audience: 'Trabajador',
      status: 'Activa',
      cycle: 'Evaluacion anual 2026',
      channel: 'Correo y WhatsApp',
      questions: this.defaultClimateSurveyQuestions(),
    },
  ];
  protected activeSurveyId = 'clima-laboral';
  protected editingSurvey = false;
  protected savedSurveySections: Record<string, string[]> = {};

  protected climateEmployee: Record<string, string> = {
    sede: 'CALLAO',
    area: '',
    puesto: '',
    antiguedad: '',
    sexo: '',
    edad: '',
  };

  protected climateLikert: Record<number, string> = Object.fromEntries(
    climateQuestions.map((question) => [question.id, 'CASI SIEMPRE' as LikertOption]),
  );
  protected climateScales: Record<number, number> = Object.fromEntries(scaleQuestions.map((question) => [question.id, 8]));
  protected climateOpen: Record<number, string> = {};
  protected climateMultiple: Record<number, Record<string, boolean>> = {};

  protected performanceGeneral: Record<string, string> = {
    evaluado: '',
    evaluador: '',
    sede: 'CALLAO',
    cargoEvaluado: '',
    cargoEvaluador: '',
    gerencia: '',
    area: '',
    periodo: new Date().getFullYear().toString(),
  };
  protected performanceScores: Record<string, number> = Object.fromEntries(competencies.map((item) => [item.id, 3]));
  protected performanceEvidence: Record<string, string> = {};
  protected potential = 3;
  protected potentialComment = '';
  protected agreement = 'De acuerdo';
  protected employeeComment = '';
  protected objectives: ObjectiveRow[] = [
    { objective: '', description: '', weight: 40, unit: '% Cumplimiento', target: '100%', result: 80 },
    { objective: '', description: '', weight: 30, unit: '% Cumplimiento', target: '100%', result: 80 },
    { objective: '', description: '', weight: 30, unit: '% Cumplimiento', target: '100%', result: 80 },
  ];
  protected trainings: TrainingRow[] = [
    { course: 'Seguimiento y Feedback', competency: 'Liderazgo', priority: 1 },
    { course: 'Gestion por Indicadores', competency: 'Orientacion al logro', priority: 2 },
  ];
  protected feedback: FeedbackRow[] = competencies.slice(0, 5).map((item) => ({
    competency: item.name,
    strength: '',
    improvement: '',
  }));

  protected readonly summary = computed<DashboardSummary>(() => this.buildSummary(this.records()));

  constructor() {
    this.loadSurveyBuilder();
    this.loadSavedSurveySections();
    this.ensureSurveyAnswerDefaults();
    this.loadRecords();
  }

  protected setView(next: ViewMode): void {
    this.view.set(next);
    this.message.set('');
  }

  protected openPortal(next: ViewMode): void {
    this.setView(next);
  }

  protected login(): void {
    this.loggedIn.set(true);
    this.activeRole.set(this.loginPortal);

    if (this.loginPortal === 'trabajador') {
      this.workerDni = this.loginDni;
      this.activeSurveyId = this.activeWorkerSurveys()[0]?.id ?? this.activeSurveyId;
      this.ensureSurveyAnswerDefaults();
      this.setView('trabajador');
    }

    if (this.loginPortal === 'jefe') {
      this.bossDni = this.loginDni;
      this.setView('jefe');
    }

    if (this.loginPortal === 'rrhh') {
      this.hrDni = this.loginDni;
      this.setView('rrhh');
    }

    this.message.set('');
  }

  protected logout(): void {
    this.loggedIn.set(false);
    this.loginPassword = '';
    this.setView('portal');
  }

  protected roleLabel(): string {
    if (this.activeRole() === 'trabajador') return 'Trabajador';
    if (this.activeRole() === 'jefe') return 'Jefe evaluador';
    return 'RRHH';
  }

  protected pendingClimate(): PersonStatus[] {
    return this.employees.filter((employee) => !employee.climateDone);
  }

  protected pendingPerformance(): PersonStatus[] {
    return this.employees.filter((employee) => !employee.performanceDone);
  }

  protected bossTeam(): PersonStatus[] {
    return this.employees.filter((employee) => employee.bossDni === this.bossDni);
  }

  protected sendReminder(kind: 'climate' | 'performance'): void {
    const pending = kind === 'climate' ? this.pendingClimate().length : this.pendingPerformance().length;
    const label = kind === 'climate' ? 'encuesta de clima laboral' : 'evaluacion de desempeno';
    this.reminderMessage = `Recordatorio preparado para ${pending} pendientes de ${label} via ${this.reminderChannel}.`;
  }

  protected scheduleCycle(): void {
    this.reminderMessage = `Programacion creada para ${this.activeCycle}: apertura, recordatorio intermedio y cierre con reporte para RRHH.`;
  }

  protected activeWorkerSurveys(): SurveyDefinition[] {
    return this.surveys.filter((survey) => survey.audience === 'Trabajador' && survey.status === 'Activa');
  }

  protected selectWorkerSurvey(surveyId: string): void {
    this.activeSurveyId = surveyId;
    this.ensureSurveyAnswerDefaults();
    this.message.set('');
  }

  protected surveySectionNames(survey: SurveyDefinition): string[] {
    const sections = new Set(survey.questions.filter((question) => question.responseType === 'likert').map((question) => question.section));
    if (survey.questions.some((question) => question.responseType === 'scale')) sections.add('Escala 0-10');
    if (survey.questions.some((question) => question.responseType === 'single_choice' || question.responseType === 'multiple_choice')) {
      sections.add('Preguntas de seleccion');
    }
    if (survey.questions.some((question) => question.responseType === 'short_text' || question.responseType === 'long_text')) {
      sections.add('Preguntas de texto');
    }
    return Array.from(sections);
  }

  protected workerSurveyProgress(survey: SurveyDefinition): number {
    const sections = this.surveySectionNames(survey);
    if (!sections.length) return 0;
    const saved = new Set(this.savedSurveySections[survey.id] ?? []);
    const completed = sections.filter((section) => saved.has(section)).length;
    return Math.round((completed / sections.length) * 100);
  }

  protected saveSurveySection(surveyId: string, section: string): void {
    const saved = new Set(this.savedSurveySections[surveyId] ?? []);
    saved.add(section);
    this.savedSurveySections = { ...this.savedSurveySections, [surveyId]: Array.from(saved) };
    localStorage.setItem('rrhh_worker_section_progress', JSON.stringify(this.savedSurveySections));
    this.message.set(`Seccion "${section}" guardada.`);
  }

  protected isSurveySectionSaved(surveyId: string, section: string): boolean {
    return (this.savedSurveySections[surveyId] ?? []).includes(section);
  }

  protected processSummaries(): ProcessSummary[] {
    const surveyProcesses = this.surveys.map((survey) => {
      const target = this.processTarget(survey.audience);
      const completed = survey.id === 'clima-laboral' ? this.employees.filter((employee) => employee.climateDone).length : 0;
      const pending = Math.max(target - completed, 0);
      return {
        id: survey.id,
        name: survey.name,
        kind: survey.status === 'Activa' ? `Encuesta ${survey.audience}` : `Borrador ${survey.audience}`,
        target,
        completed,
        pending,
        progress: target ? Math.round((completed / target) * 100) : 0,
        status: survey.status,
      };
    });
    const performanceTarget = this.employees.length;
    const performanceCompleted = this.employees.filter((employee) => employee.performanceDone).length;
    return [
      ...surveyProcesses,
      {
        id: 'performance',
        name: 'Evaluacion de desempeno',
        kind: 'Evaluacion Jefe',
        target: performanceTarget,
        completed: performanceCompleted,
        pending: Math.max(performanceTarget - performanceCompleted, 0),
        progress: performanceTarget ? Math.round((performanceCompleted / performanceTarget) * 100) : 0,
        status: 'Activa',
      },
    ];
  }

  protected filteredTrackingPeople(): PersonStatus[] {
    return this.trackingPeople().slice(0, 12);
  }

  protected trackingResultCount(): number {
    return this.trackingPeople().length;
  }

  protected completedProcessCount(employee: PersonStatus): number {
    return Number(employee.climateDone) + Number(employee.performanceDone);
  }

  protected pendingProcessLabels(employee: PersonStatus): string {
    const pending = [
      !employee.climateDone ? 'Clima laboral' : '',
      !employee.performanceDone ? 'Desempeno' : '',
    ].filter(Boolean);
    return pending.length ? pending.join(', ') : 'Sin pendientes';
  }

  protected updateSurveyCycle(survey: SurveyDefinition, value: string): void {
    survey.cycle = value;
    this.saveSurveyBuilder();
  }

  protected updateSurveyChannel(survey: SurveyDefinition, value: string): void {
    survey.channel = value;
    this.saveSurveyBuilder();
  }

  protected scheduleSurvey(survey: SurveyDefinition): void {
    this.reminderMessage = `Programacion creada para ${survey.name}: ${survey.cycle || this.activeCycle}.`;
    this.saveSurveyBuilder();
  }

  protected sendSurveyReminder(survey: SurveyDefinition): void {
    const summary = this.processSummaries().find((item) => item.id === survey.id);
    this.reminderMessage = `Recordatorio preparado para ${summary?.pending ?? 0} pendientes de ${survey.name} via ${survey.channel || this.reminderChannel}.`;
  }

  protected questionsByDimension(): { dimension: string; questions: SurveyQuestion[] }[] {
    const grouped = new Map<string, SurveyQuestion[]>();
    for (const question of this.likertSurveyQuestions()) {
      grouped.set(question.section, [...(grouped.get(question.section) ?? []), question]);
    }
    return Array.from(grouped, ([dimension, questions]) => ({ dimension, questions }));
  }

  protected likertSurveyQuestions(): SurveyQuestion[] {
    return this.activeSurveyQuestions().filter((question) => question.responseType === 'likert');
  }

  protected singleChoiceSurveyQuestions(): SurveyQuestion[] {
    return this.activeSurveyQuestions().filter((question) => question.responseType === 'single_choice');
  }

  protected multipleChoiceSurveyQuestions(): SurveyQuestion[] {
    return this.activeSurveyQuestions().filter((question) => question.responseType === 'multiple_choice');
  }

  protected scaleSurveyQuestions(): SurveyQuestion[] {
    return this.activeSurveyQuestions().filter((question) => question.responseType === 'scale');
  }

  protected textSurveyQuestions(): SurveyQuestion[] {
    return this.activeSurveyQuestions().filter((question) => question.responseType === 'short_text' || question.responseType === 'long_text');
  }

  protected addSurveyQuestion(): void {
    const survey = this.activeSurvey();
    const nextId = Math.max(0, ...survey.questions.map((question) => question.id)) + 1;
    survey.questions = [
      ...survey.questions,
      {
        id: nextId,
        section: 'Nueva seccion',
        text: 'Nueva pregunta',
        responseType: 'single_choice',
        required: true,
        options: ['Opcion 1'],
      },
    ];
    this.climateOpen[nextId] = '';
    this.saveSurveyBuilder();
  }

  protected duplicateSurveyQuestion(question: SurveyQuestion): void {
    const survey = this.activeSurvey();
    const nextId = Math.max(0, ...survey.questions.map((item) => item.id)) + 1;
    survey.questions = [
      ...survey.questions,
      { ...question, id: nextId, text: `${question.text} (copia)` },
    ];
    this.saveSurveyBuilder();
  }

  protected deleteSurveyQuestion(questionId: number): void {
    const survey = this.activeSurvey();
    survey.questions = survey.questions.filter((question) => question.id !== questionId);
    delete this.climateLikert[questionId];
    delete this.climateScales[questionId];
    delete this.climateOpen[questionId];
    this.saveSurveyBuilder();
  }

  protected updateSurveyQuestionType(question: SurveyQuestion): void {
    if (question.responseType === 'likert') {
      question.options = question.options?.length ? question.options : [...this.likertDefaultOptions];
    }
    if (question.responseType === 'single_choice' || question.responseType === 'multiple_choice') {
      question.options = question.options?.length ? question.options : ['Opcion 1'];
    }
    if ((question.responseType === 'likert' || question.responseType === 'single_choice') && !this.climateLikert[question.id]) {
      this.climateLikert[question.id] = question.responseType === 'likert' ? 'CASI SIEMPRE' : (question.options?.[0] ?? 'Opcion 1');
    }
    if (question.responseType === 'multiple_choice' && !this.climateMultiple[question.id]) {
      this.climateMultiple[question.id] = {};
    }
    if (question.responseType === 'scale' && this.climateScales[question.id] === undefined) {
      this.climateScales[question.id] = 8;
      question.lowLabel = question.lowLabel || 'Minimo';
      question.highLabel = question.highLabel || 'Maximo';
    }
    if ((question.responseType === 'short_text' || question.responseType === 'long_text') && this.climateOpen[question.id] === undefined) {
      this.climateOpen[question.id] = '';
    }
    this.saveSurveyBuilder();
  }

  protected addQuestionOption(question: SurveyQuestion): void {
    question.options = [...(question.options ?? []), `Opcion ${(question.options?.length ?? 0) + 1}`];
    this.saveSurveyBuilder();
  }

  protected optionTrack(questionId: number, option: string): string {
    return `${questionId}-${option}`;
  }

  protected deleteQuestionOption(question: SurveyQuestion, optionIndex: number): void {
    question.options = (question.options ?? []).filter((_, index) => index !== optionIndex);
    this.saveSurveyBuilder();
  }

  protected optionInputType(question: SurveyQuestion): string {
    return question.responseType === 'multiple_choice' ? 'checkbox' : 'radio';
  }

  protected choiceSurveyQuestions(): SurveyQuestion[] {
    return this.activeSurveyQuestions().filter((question) => question.responseType === 'likert' || question.responseType === 'single_choice' || question.responseType === 'multiple_choice');
  }

  protected likertValue(option: string | undefined): number {
    return option && option in likertScore ? likertScore[option as LikertOption] : 0;
  }

  protected saveSurveyBuilder(): void {
    localStorage.setItem('rrhh_survey_builder', JSON.stringify({ surveys: this.surveys, activeSurveyId: this.activeSurveyId }));
    this.ensureSurveyAnswerDefaults();
    this.message.set('Preguntas de la encuesta actualizadas.');
  }

  protected surveyTypeCount(survey: SurveyDefinition, type: ResponseType): number {
    return survey.questions.filter((question) => question.responseType === type).length;
  }

  protected openSurveyEditor(surveyId: string): void {
    this.activeSurveyId = surveyId;
    this.editingSurvey = true;
    this.ensureSurveyAnswerDefaults();
  }

  protected closeSurveyEditor(): void {
    this.editingSurvey = false;
    this.saveSurveyBuilder();
  }

  protected updateActiveSurveyName(value: string): void {
    this.activeSurvey().name = value;
    this.saveSurveyBuilder();
  }

  protected updateActiveSurveyDescription(value: string): void {
    this.activeSurvey().description = value;
    this.saveSurveyBuilder();
  }

  protected updateActiveSurveyAudience(value: SurveyDefinition['audience']): void {
    this.activeSurvey().audience = value;
    this.saveSurveyBuilder();
  }

  protected updateActiveSurveyStatus(value: SurveyDefinition['status']): void {
    this.activeSurvey().status = value;
    this.saveSurveyBuilder();
  }

  protected addSurveyDraft(): void {
    const nextNumber = this.surveys.length + 1;
    const id = `encuesta-${Date.now()}`;
    this.surveys = [
      ...this.surveys,
      {
        id,
        name: `Nueva encuesta ${nextNumber}`,
        description: 'Encuesta en borrador para configurar.',
        audience: 'Trabajador',
        status: 'Borrador',
        cycle: this.activeCycle,
        channel: this.reminderChannel,
        questions: [
          {
            id: 1,
            section: 'General',
            text: 'Nueva pregunta',
            responseType: 'single_choice',
            required: true,
            options: ['Opcion 1'],
          },
        ],
      },
    ];
    this.openSurveyEditor(id);
    this.saveSurveyBuilder();
  }

  protected activeSurvey(): SurveyDefinition {
    return this.surveys.find((survey) => survey.id === this.activeSurveyId) ?? this.surveys[0];
  }

  protected activeSurveyQuestions(): SurveyQuestion[] {
    return this.activeSurvey().questions;
  }

  protected competenciesByGroup(): { group: string; items: Competency[] }[] {
    const grouped = new Map<string, Competency[]>();
    for (const competency of this.competencies) {
      grouped.set(competency.group, [...(grouped.get(competency.group) ?? []), competency]);
    }
    return Array.from(grouped, ([group, items]) => ({ group, items }));
  }

  protected climatePreview(): number {
    const total = this.likertSurveyQuestions().reduce((sum, question) => sum + this.likertValue(this.climateLikert[question.id]), 0);
    const likertCount = Math.max(1, this.likertSurveyQuestions().length);
    const scaleCount = Math.max(1, this.scaleSurveyQuestions().length);
    const likertPercent = (total / (likertCount * 5)) * 100;
    const scalePercent =
      this.scaleSurveyQuestions().reduce((sum, question) => sum + Number(this.climateScales[question.id] || 0), 0) / (scaleCount * 10) * 100;
    return Math.round((likertPercent * 0.8 + scalePercent * 0.2) * 10) / 10;
  }

  protected performancePreview(): number {
    const competencyAvg = this.average(Object.values(this.performanceScores).map((value) => Number(value || 0))) / 5 * 100;
    const objectiveRows = this.objectives.filter((row) => row.objective.trim());
    const objectiveScore = objectiveRows.length
      ? objectiveRows.reduce((sum, row) => sum + (Number(row.weight || 0) / 100) * Number(row.result || 0), 0)
      : competencyAvg;
    return Math.round((competencyAvg * 0.7 + objectiveScore * 0.3) * 10) / 10;
  }

  protected submitClimate(): void {
    const payload: ClimateSubmission = {
      type: 'climate',
      createdAt: new Date().toISOString(),
      employee: { ...this.climateEmployee },
      likert: { ...this.climateLikert },
      scales: { ...this.climateScales },
      open: { ...this.climateOpen },
      multiple: Object.fromEntries(
        Object.entries(this.climateMultiple).map(([questionId, values]) => [
          questionId,
          Object.entries(values).filter(([, checked]) => checked).map(([option]) => option),
        ]),
      ),
    };
    this.persist('climate', payload);
  }

  protected submitPerformance(): void {
    const payload: PerformanceSubmission = {
      type: 'performance',
      createdAt: new Date().toISOString(),
      general: { ...this.performanceGeneral },
      scores: { ...this.performanceScores },
      evidence: { ...this.performanceEvidence },
      potential: Number(this.potential || 0),
      potentialComment: this.potentialComment,
      objectives: this.objectives.map((row) => ({ ...row, weight: Number(row.weight || 0), result: Number(row.result || 0) })),
      trainings: this.trainings.map((row) => ({ ...row, priority: Number(row.priority || 0) })),
      feedback: this.feedback.map((row) => ({ ...row })),
      agreement: this.agreement,
      employeeComment: this.employeeComment,
    };
    this.persist('performance', payload);
  }

  protected exportJson(): void {
    const blob = new Blob([JSON.stringify(this.records(), null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `rrhh-resultados-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  protected addObjective(): void {
    this.objectives.push({ objective: '', description: '', weight: 0, unit: '% Cumplimiento', target: '', result: 0 });
  }

  protected addTraining(): void {
    this.trainings.push({ course: '', competency: '', priority: this.trainings.length + 1 });
  }

  protected addFeedback(): void {
    this.feedback.push({ competency: '', strength: '', improvement: '' });
  }

  protected statusFor(value: number): string {
    if (value > 80) return 'Saludable';
    if (value > 50) return 'En proceso de mejora';
    return 'No saludable';
  }

  protected trackByLabel(_: number, item: { label: string }): string {
    return item.label;
  }

  private persist(kind: 'climate' | 'performance', payload: ClimateSubmission | PerformanceSubmission): void {
    this.saving.set(true);
    this.http.post(`${apiBase}?action=${kind}`, payload).subscribe({
      next: () => this.afterPersist(payload, 'Registro guardado en backend PHP.'),
      error: () => this.afterPersist(payload, 'Backend PHP no disponible; registro guardado localmente para la demo.'),
    });
  }

  private afterPersist(payload: ClimateSubmission | PerformanceSubmission, message: string): void {
    this.records.update((items) => [payload, ...items]);
    localStorage.setItem('rrhh_records', JSON.stringify(this.records()));
    this.saving.set(false);
    this.message.set(message);
    this.view.set(this.activeRole());
  }

  private loadRecords(): void {
    const local = this.readLocalRecords();
    this.records.set(local);
    this.http.get<(ClimateSubmission | PerformanceSubmission)[]>(`${apiBase}?action=records`).subscribe({
      next: (items) => {
        if (Array.isArray(items)) {
          const merged = [...items, ...local].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
          this.records.set(merged);
        }
      },
      error: () => undefined,
    });
  }

  private readLocalRecords(): (ClimateSubmission | PerformanceSubmission)[] {
    try {
      return JSON.parse(localStorage.getItem('rrhh_records') ?? '[]');
    } catch {
      return [];
    }
  }

  private loadSavedSurveySections(): void {
    try {
      this.savedSurveySections = JSON.parse(localStorage.getItem('rrhh_worker_section_progress') ?? '{}');
    } catch {
      this.savedSurveySections = {};
    }
  }

  private loadSurveyBuilder(): void {
    try {
      const stored = JSON.parse(localStorage.getItem('rrhh_survey_builder') ?? 'null');
      if (Array.isArray(stored?.surveys)) {
        this.surveys = stored.surveys.map((survey: SurveyDefinition) => ({
          ...survey,
          cycle: survey.cycle ?? this.activeCycle,
          channel: survey.channel ?? this.reminderChannel,
          questions: this.hydrateSurveyQuestions(survey.id, survey.questions),
        }));
        this.activeSurveyId = stored.activeSurveyId ?? this.surveys[0]?.id ?? 'clima-laboral';
      } else if (stored?.name && Array.isArray(stored?.questions)) {
        this.surveys[0].name = stored.name;
        this.surveys[0].questions = this.hydrateSurveyQuestions('clima-laboral', stored.questions);
      }
    } catch {
      return;
    }
  }

  private hydrateSurveyQuestions(surveyId: string, questions: SurveyQuestion[]): SurveyQuestion[] {
    const normalized = questions.map((question) => ({
      ...question,
      options: this.normalizedOptions(question),
    }));
    if (surveyId !== 'clima-laboral') return normalized;

    const existingIds = new Set(normalized.map((question) => question.id));
    const missingBaseQuestions = this.defaultClimateSurveyQuestions().filter((question) => !existingIds.has(question.id));
    return [...normalized, ...missingBaseQuestions];
  }

  private normalizedOptions(question: SurveyQuestion): string[] | undefined {
    if (question.responseType === 'likert') return question.options?.length ? question.options : [...this.likertDefaultOptions];
    if (question.responseType === 'single_choice' || question.responseType === 'multiple_choice') return question.options?.length ? question.options : ['Opcion 1'];
    return question.options;
  }

  private processTarget(audience: SurveyDefinition['audience']): number {
    if (audience === 'Trabajador') return this.employees.length;
    if (audience === 'Jefe') return new Set(this.employees.map((employee) => employee.bossDni)).size;
    return 1;
  }

  private trackingPeople(): PersonStatus[] {
    const query = this.trackingQuery.trim().toLowerCase();
    return this.employees.filter((employee) => {
      const matchesQuery = !query || `${employee.dni} ${employee.name} ${employee.area} ${employee.position}`.toLowerCase().includes(query);
      const done = this.isPersonDoneForSelectedProcess(employee);
      const matchesStatus =
        this.trackingStatus === 'all' ||
        (this.trackingStatus === 'done' && done) ||
        (this.trackingStatus === 'pending' && !done);
      return matchesQuery && matchesStatus;
    });
  }

  private isPersonDoneForSelectedProcess(employee: PersonStatus): boolean {
    if (this.trackingProcessId === 'clima-laboral') return employee.climateDone;
    if (this.trackingProcessId === 'performance') return employee.performanceDone;
    if (this.trackingProcessId !== 'all') return false;
    return employee.climateDone && employee.performanceDone;
  }

  private ensureSurveyAnswerDefaults(): void {
    for (const question of this.activeSurveyQuestions()) {
      if (question.responseType === 'likert') {
        question.options = question.options?.length ? question.options : [...this.likertDefaultOptions];
        this.climateLikert[question.id] = this.climateLikert[question.id] || question.options[3] || question.options[0];
      }
      if (question.responseType === 'single_choice') {
        question.options = question.options?.length ? question.options : ['Opcion 1'];
        this.climateLikert[question.id] = this.climateLikert[question.id] || question.options[0];
      }
      if (question.responseType === 'multiple_choice') {
        question.options = question.options?.length ? question.options : ['Opcion 1'];
        this.climateMultiple[question.id] = this.climateMultiple[question.id] || {};
        for (const option of question.options) {
          this.climateMultiple[question.id][option] = this.climateMultiple[question.id][option] || false;
        }
      }
      if (question.responseType === 'scale') {
        this.climateScales[question.id] = this.climateScales[question.id] ?? 8;
      }
      if (question.responseType === 'short_text' || question.responseType === 'long_text') {
        this.climateOpen[question.id] = this.climateOpen[question.id] ?? '';
      }
    }
  }

  private buildSummary(records: (ClimateSubmission | PerformanceSubmission)[]): DashboardSummary {
    const climate = records.filter((item): item is ClimateSubmission => item.type === 'climate');
    const performance = records.filter((item): item is PerformanceSubmission => item.type === 'performance');
    const dimensionScores = this.dimensionScores(climate);
    const competencyScores = this.competencyScores(performance);
    const climateAverage = this.average(dimensionScores.map((item) => item.value));
    return {
      climateCount: climate.length,
      performanceCount: performance.length,
      climateAverage,
      performanceAverage: this.average(performance.map((item) => this.performanceScore(item))),
      climateStatus: this.statusFor(climateAverage),
      dimensionScores,
      competencyScores,
      likertDistribution: this.likertDistribution(climate),
    };
  }

  private dimensionScores(records: ClimateSubmission[]): { label: string; value: number }[] {
    return this.questionsByDimension().map(({ dimension, questions }) => {
      const scores = records.flatMap((record) => questions.map((question) => this.likertValue(record.likert[question.id])).filter(Boolean));
      return { label: dimension, value: Math.round((this.average(scores) / 5) * 1000) / 10 };
    });
  }

  private competencyScores(records: PerformanceSubmission[]): { label: string; value: number }[] {
    return this.competencies.map((competency) => {
      const values = records.map((record) => Number(record.scores[competency.id] || 0)).filter(Boolean);
      return { label: competency.name, value: Math.round((this.average(values) / 5) * 1000) / 10 };
    });
  }

  private likertDistribution(records: ClimateSubmission[]): { label: string; value: number }[] {
    const total = records.length * this.likertSurveyQuestions().length || 1;
    return this.likertOptions.map((option) => {
      const count = records.reduce((sum, record) => {
        return sum + Object.values(record.likert).filter((value) => value === option).length;
      }, 0);
      return { label: option, value: Math.round((count / total) * 1000) / 10 };
    });
  }

  private performanceScore(record: PerformanceSubmission): number {
    return this.average(Object.values(record.scores).map((value) => Number(value || 0))) / 5 * 100;
  }

  private average(values: number[]): number {
    const valid = values.filter((value) => Number.isFinite(value) && value > 0);
    if (!valid.length) return 0;
    return Math.round((valid.reduce((sum, value) => sum + value, 0) / valid.length) * 10) / 10;
  }

  private defaultClimateSurveyQuestions(): SurveyQuestion[] {
    return [
      ...climateQuestions.map((question) => ({
        id: question.id,
        section: question.dimension,
        text: question.text,
        responseType: 'likert' as ResponseType,
        required: true,
        options: ['NUNCA', 'CASI NUNCA', 'A VECES', 'CASI SIEMPRE', 'SIEMPRE'],
      })),
      ...scaleQuestions.map((question) => ({
        id: question.id,
        section: question.dimension,
        text: question.text,
        responseType: 'scale' as ResponseType,
        required: true,
        lowLabel: question.lowLabel,
        highLabel: question.highLabel,
      })),
      ...openQuestions.map((question) => ({
        id: question.id,
        section: 'Preguntas abiertas',
        text: question.text,
        responseType: 'long_text' as ResponseType,
        required: false,
      })),
      {
        id: 54,
        section: 'Seleccion multiple',
        text: 'En que aspectos deberia mejorar para que recomiende mas a DACHASAC? (Elija hasta 3 opciones)',
        responseType: 'multiple_choice' as ResponseType,
        required: false,
        options: [
          'Ambiente laboral',
          'Relacion con mis companeros de trabajo',
          'Posibilidad de aprender y desarrollarme',
          'Vida integralmente equilibrada',
          'Oportunidad de generar valor/impacto con mi trabajo',
          'Relacion con mi jefe',
          'Reconocimiento',
          'Liderazgo organizacional',
          'Cultura',
          'Condiciones de trabajo',
          'Identificacion con el proposito de la organizacion',
          'Beneficios no remunerativos',
          'Compensacion',
          'Colaboracion e interaccion con otras areas',
          'Estabilidad laboral',
          'Cercania y accesibilidad al lugar del trabajo',
          'Programas de Recursos Humanos',
        ],
      },
      {
        id: 55,
        section: 'Seleccion multiple',
        text: 'Que aspectos consideras que deberian mejorar en tu area?',
        responseType: 'multiple_choice' as ResponseType,
        required: false,
        options: [
          'Ningun aspecto a mejorar',
          'Companerismo entre los miembros del equipo',
          'Posibilidad de aprender, retos profesionales',
          'Ambiente de trabajo',
          'Relacion con mi jefe',
          'Comunicacion entre miembros del equipo a todo nivel',
          'Horarios y jornada laboral',
          'Mejor experiencia para clientes internos y externos',
          'Trato justo sin importar edad, genero o puesto',
        ],
      },
      {
        id: 56,
        section: 'Seleccion multiple',
        text: 'Que aspectos valoras de tu area?',
        responseType: 'multiple_choice' as ResponseType,
        required: false,
        options: [
          'Companerismo entre los miembros del equipo',
          'Tareas de alto impacto',
          'Posibilidad de aprender, retos profesionales',
          'Reconocimiento',
          'Ambiente de trabajo',
          'Relacion con mi jefe',
          'Comunicacion fluida entre miembros del equipo',
          'Horarios y jornada laboral',
          'Trato justo al colaborador',
          'Se toman en cuenta opiniones, ideas y sugerencias',
        ],
      },
    ];
  }
}
