let Matiere = require("../model/matiere");

// Récupérer tous les matieres (GET)
/*
function getMatieres(req, res){
    Matiere.find((err, matieres) => {
        if(err){
            res.send(err)
        }

        res.send(matieres);
    });
}
*/

function getMatieres(req, res) {
  let aggregateQuery = Matiere.aggregate();

  Matiere.aggregatePaginate(
    aggregateQuery,
    {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
    },
    (err, data) => {
      if (err) {
        res.send(err);
      }

      res.send(data);
    }
  );
}

// Récupérer un matiere par son id (GET)
function getMatiere(req, res) {
  let matiereId = req.params.id;
  Matiere.findById(matiereId, (err, matiere) => {
    if (err) {
      res.send(err);
    }
    res.json(matiere);
  });

  /*
    Matiere.findOne({id: matiereId}, (err, matiere) =>{
        if(err){res.send(err)}
        res.json(matiere);
    })
    */
}

// Ajout d'un matiere (POST)
function postMatiere(req, res) {
  let matiere = new Matiere();
  matiere.name = req.body.name;
  matiere.teacher_id = req.teacher._id;
  console.log("POST matiere reçu :");

  matiere.save((err) => {
    if (err) {
      res.send("cant post matiere ", err);
    }
    res.json({ message: `${matiere.name} saved!` });
  });
}

// Update d'un matiere (PUT)
function updateMatiere(req, res) {
  console.log("UPDATE recu matiere : ");
  console.log(req.body);
  Matiere.findByIdAndUpdate(
    req.body._id,
    req.body,
    { new: true },
    (err, matiere) => {
      if (err) {
        console.log(err);
        res.send(err);
      } else {
        res.json({ message: "updated" });
      }

      // console.log('updated ', matiere)
    }
  );
}

// suppression d'un matiere (DELETE)
// l'id est bien le _id de mongoDB
function deleteMatiere(req, res) {
  Matiere.findByIdAndRemove(req.params.id, (err, matiere) => {
    if (err) {
      res.send(err);
    }
    res.json({ message: `${matiere.name} deleted` });
  });
}

module.exports = {
  getMatieres,
  postMatiere,
  getMatiere,
  updateMatiere,
  deleteMatiere,
};
