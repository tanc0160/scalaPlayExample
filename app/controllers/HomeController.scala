package controllers

import javax.inject._
import play.api._
import play.api.mvc._
import play.api.libs.json._
import play.api.libs.functional.syntax._
import play.api.libs.ws._
import play.api.http.HttpEntity
import scala.concurrent.Future

import scala.concurrent.ExecutionContext

/**
 * This controller creates an `Action` to handle HTTP requests to the
 * application's home page.
 */
@Singleton
class HomeController @Inject() (implicit ec:ExecutionContext, ws: WSClient) extends Controller {

  case class Place(id: Int, name: String)

  case class Question(id: Int, answer: String)
  case class Fitness(templateName: String, user: String, questions: Seq[Question])
  val places = List(
      Place(1, "Hello World"),
      Place(2, "JJ"),
      Place(3, "Euro")
  )

  implicit val placesWrites = Json.writes[Place]
  implicit val placesReads = Json.reads[Place]

  implicit val questionReads = Json.reads[Question]

  implicit val fitnessReads: Reads[Fitness] = (
    (JsPath \ "templateName").read[String] and
      (JsPath \ "user").read[String] and
      (JsPath \ "questions").read[Seq[Question]]
    )(Fitness.apply _)

  /**
   * Create an Action to render an HTML page with a welcome message.
   * The configuration in the `routes` file means that this method
   * will be called when the application receives a `GET` request with
   * a path of `/`.
   */
  def index = Action {
    Ok(views.html.index("Your new application is ready."))
  }

  /*def listPlaces = Action {
    //val json = Json.toJson(places)
    val url = "http://localhost:3000/places"
    val result: Future[JsResult[Seq[Place]]] = ws.url(url).get().map{
      f => (f.json).validate[Seq[Place]]
    }
    Ok(Json.obj("status" -> "ok"))
  }*/

  def listPlaces = Action.async {
    val url = "http://localhost:3000/places"
    ws.url(url).get().map { response =>
      Ok(response.json)
    }
  }
  /*implicit val rds = (
    (__ \ 'name).read[String] and
      (__ \ 'age).read[Long]
    ) tupled
*/

  def sayHello = Action(parse.json) { request =>
    request.body.validate[Fitness] match {
      case s: JsSuccess[Fitness] => {
        val f: Fitness = s.get
        // do something with fitness
        for(q <- f.questions)
          println(q.id + " _ " + q.answer)
        Ok(Json.obj("status" ->"OK", "templateName" -> f.templateName, "user" -> f.user ))
      }
      case e: JsError => {
        // error handling flow
        BadRequest(Json.obj("status" ->"KO", "message" -> JsError.toJson(e)))
      }
    }
  }

  def upload = Action(parse.multipartFormData) { request =>
    request.body.file("file").map { file =>
      import java.io.File
      val filename = file.filename
      val contentType = file.contentType
      file.ref.moveTo(new File(s"tmp/picture/$filename"), true)
      val docname: Option[Seq[String]] = request.body.dataParts.get("docname")
      val templateName: Option[Seq[String]] = request.body.dataParts.get("templateName")
      println(docname.get(0) + " _ " + templateName.get(0))
      Ok(Json.obj("status" -> "success", "docname" -> docname.get(0), "templateName" -> templateName.get(0)))
    }.getOrElse {
      BadRequest(Json.obj("status" ->"KO"));
    }
  }
}
